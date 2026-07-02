import Employee from '../models/Employee.js';
import Leave from '../models/Leave.js';
import Payroll from '../models/Payroll.js';
import User from '../models/User.js';

const resolveEmployeeReference = async (employeeId) => {
    if (!employeeId) return null;

    let employee = await Employee.findById(employeeId);
    if (employee) return employee;

    const user = await User.findById(employeeId).select('-password');
    if (!user) return null;

    return Employee.create({
        name: user.name,
        email: user.email,
        department: 'General',
        joiningDate: new Date(),
        role: user.role || 'Employee',
        salary: 0,
        status: 'Active',
    });
};

export const createEmployee = async (req, res) => {
    try {
        const { name, email, department, joiningDate, role, salary } = req.body;
        const existing = await Employee.findOne({ email: email.toLowerCase() });
        if (existing) return res.status(400).json({ message: 'Employee already exists' });

        const employee = await Employee.create({
            name,
            email: email.toLowerCase(),
            department,
            joiningDate,
            role: role || 'Employee',
            salary: Number(salary) || 0,
            status: 'Onboarding',
        });

        res.status(201).json({ message: 'Employee created successfully', employee });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to create employee' });
    }
};

export const getEmployees = async (req, res) => {
    try {
        const employees = await Employee.find().sort({ createdAt: -1 });
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to load employees' });
    }
};

export const updateEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        const { name, email, department, joiningDate, role, salary, status } = req.body;
        employee.name = name ?? employee.name;
        employee.email = email ? email.toLowerCase() : employee.email;
        employee.department = department ?? employee.department;
        employee.joiningDate = joiningDate ?? employee.joiningDate;
        employee.role = role ?? employee.role;
        employee.salary = salary !== undefined ? Number(salary) : employee.salary;
        employee.status = status ?? employee.status;

        const updated = await employee.save();
        res.json({ message: 'Employee updated successfully', employee: updated });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to update employee' });
    }
};

export const deleteEmployee = async (req, res) => {
    try {
        const deleted = await Employee.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Employee not found' });
        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to delete employee' });
    }
};

export const createLeave = async (req, res) => {
    try {
        const { employee, type, startDate, endDate, reason, requestedBy } = req.body;
        const resolvedEmployee = await resolveEmployeeReference(employee);
        const leave = await Leave.create({ employee: resolvedEmployee?._id || employee, type, startDate, endDate, reason, requestedBy });
        res.status(201).json({ message: 'Leave request created', leave });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to create leave request' });
    }
};

export const getLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find().populate('employee', 'name email role');
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to load leave requests' });
    }
};

export const updateLeave = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);
        if (!leave) return res.status(404).json({ message: 'Leave request not found' });

        const { status, reason } = req.body;
        leave.status = status ?? leave.status;
        leave.reason = reason ?? leave.reason;

        await leave.save();
        res.json({ message: 'Leave request updated', leave });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to update leave request' });
    }
};

export const deleteLeave = async (req, res) => {
    try {
        const deleted = await Leave.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Leave request not found' });
        res.json({ message: 'Leave request deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to delete leave request' });
    }
};

export const createPayroll = async (req, res) => {
    try {
        const { employee, month, year, grossSalary, deductions, pf = 0, esi = 0, professionalTax = 0 } = req.body;
        const resolvedEmployee = await resolveEmployeeReference(employee);
        const netSalary = Number(grossSalary) - Number(deductions) - Number(pf) - Number(esi) - Number(professionalTax);

        const payroll = await Payroll.create({
            employee: resolvedEmployee?._id || employee,
            month,
            year: Number(year),
            grossSalary: Number(grossSalary),
            deductions: Number(deductions),
            netSalary,
            statutoryDeductions: { pf: Number(pf), esi: Number(esi), professionalTax: Number(professionalTax) },
        });

        res.status(201).json({ message: 'Payroll created successfully', payroll });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to create payroll' });
    }
};

export const getPayrolls = async (req, res) => {
    try {
        const payrolls = await Payroll.find().populate('employee', 'name email department role');
        res.json(payrolls);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to load payrolls' });
    }
};

export const calculatePayroll = async (req, res) => {
    try {
        const { employeeId, month, year } = req.params;
        const employee = await Employee.findById(employeeId);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        const grossSalary = employee.salary;
        const pf = Number((grossSalary * 0.12).toFixed(2));
        const esi = Number((grossSalary * 0.0175).toFixed(2));
        const professionalTax = grossSalary > 15000 ? 200 : 0;
        const deductions = pf + esi + professionalTax;
        const netSalary = grossSalary - deductions;

        res.json({ employee, month, year: Number(year), grossSalary, deductions, netSalary, statutoryDeductions: { pf, esi, professionalTax } });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to calculate payroll' });
    }
};

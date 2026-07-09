

function Spinner() {
    return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-blue-950 text-white">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-900 border-t-blue-400"></div>
            <p className="mt-4 text-sm font-medium text-blue-300">Loading...</p>
        </div>
    );
}

export default Spinner;
import mongoose from 'mongoose';

const aiForecastStateSchema = new mongoose.Schema(
    {
        modelName: {
            type: String,
            required: true,
            default: 'Prophet + ML Ensemble',
        },
        lastTrainedOn: {
            type: Date,
            required: true,
            default: Date.now,
        },
        nextTraining: {
            type: Date,
            required: true,
            default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // Next day
        },
        dataPointsUsed: {
            type: Number,
            required: true,
            default: 24560,
        },
        modelAccuracy: {
            type: Number,
            required: true,
            default: 92.4,
        },
        forecastDrivers: [
            {
                name: { type: String, required: true },
                percentage: { type: Number, required: true },
            }
        ]
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('AIForecastState', aiForecastStateSchema);

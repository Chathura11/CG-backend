import ScheduleProgress from "../models/scheduleProgress.js";


export async function getScheduleProgressesByUser(req,res){
    try {
        if(req.user == null){
            return res.status(403).json({message:"Unauthorized!"});
        }
        const { userEmail } = req.params;

        const scheduleProgresses = await ScheduleProgress.find({ userEmail });
        res.status(200).json(scheduleProgresses);

    } catch (error) {
        res.status(500).json({ message: 'Failed to get schedule progresses' });
    }
}
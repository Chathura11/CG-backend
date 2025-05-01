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

export async function getProgressByDate(req, res){
    try {
        if(req.user == null){
            return res.status(403).json({message:"Unauthorized!"});
        }

        const { userEmail } = req.params;
        const { date, type } = req.body;
  
        const inputDate = new Date(date);
        const day = inputDate.getDate();
        const month = inputDate.getMonth() + 1;
        const year = inputDate.getFullYear();
        const week = Math.ceil((day + new Date(year, month - 1, 1).getDay()) / 7);

        const filter = { userEmail, type, month, year };

        if (type === 'daily') filter.day = day;
        if (type === 'weekly') filter.week = week;

        const progress = await ScheduleProgress.findOne(filter);

        if (!progress) {
            return res.status(404).json({ message: 'No progress found for this date and type' });
        }

        res.status(200).json(progress);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching progress by date', details: error.message });
    }
  };
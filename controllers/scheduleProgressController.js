import ScheduleProgress from "../models/scheduleProgress.js";


export async function getScheduleProgressesByUser(req,res){
    try {
        if(req.user == null){
            return res.status(403).json({message:"Unauthorized!"});
        }
        const  userEmail  = req.user.email;

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

        const  userEmail  = req.user.email;
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


  function getWeekOfMonth(date) {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfWeek = startOfMonth.getDay(); // Sunday = 0
    const adjustedDate = date.getDate() + dayOfWeek;
    return Math.ceil(adjustedDate / 7);
  }
  
  export async function getCurrentScheduleProgress(req, res) {
    try {
      if (!req.user) {
        return res.status(403).json({ message: "Unauthorized!" });
      }
  
      const userEmail = req.user.email;
      const now = new Date();
      const day = now.getDate();
      const month = now.getMonth() + 1; // JS month is 0-based
      const year = now.getFullYear();
      const week = getWeekOfMonth(now);
  
      const progresses = await ScheduleProgress.find({
        userEmail,
        $or: [
          { type: "daily", day, month, year },
          { type: "weekly", week, month, year },
          { type: "monthly", month, year },
          { type: "yearly", year }
        ]
      });
  
      res.status(200).json(progresses);
    } catch (error) {
      console.error("Error getting current schedule progress:", error);
      res.status(500).json({ message: "Failed to get current schedule progress" });
    }
  }
import Schedule from "../models/schedule.js";

export async function createSchedule(req,res){
    try {

        if(req.user == null){
            return res.status(403).json({message:"Unauthorized!"});
        }

        const { type, targetAmount, categories, remindersEnabled ,isEnabled} = req.body;
        const userEmail = req.user.email;
        const newSchedule = new Schedule({
          userEmail,
          type,
          targetAmount,
          categories,
          remindersEnabled,
          isEnabled
        });
    
        await newSchedule.save();
        res.status(200).json({ message: 'Schedule created successfully', schedule: newSchedule });
    
    } catch (err) {
        res.status(500).json({ message: 'Failed to create schedule' });
    }
} 

export async function getSchedulesByUser(req, res){
    try {
        if(req.user == null){
            return res.status(403).json({message:"Unauthorized!"});
        }

        const { userEmail } = req.params;
        const schedules = await Schedule.find({ userEmail });
        res.status(200).json(schedules);
    } catch (err) {
        res.status(500).json({ message: 'Failed to get schedules' });
    }
};

export async function updateSchedule(req, res){
    try {
        if(req.user == null){
            return res.status(403).json({message:"Unauthorized!"});
        }

        const { id } = req.params;
        const updated = await Schedule.findByIdAndUpdate(id, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: 'Schedule not found' });
        res.status(200).json({ message: 'Schedule updated', schedule: updated });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update schedule' });
    }
};

export async function deleteSchedule(req, res){
    try {
        if(req.user == null){
            return res.status(403).json({message:"Unauthorized!"});
        }

        const { id } = req.params;
        const deleted = await Schedule.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ error: 'Schedule not found' });
        res.status(200).json({ message: 'Schedule deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete schedule' });
    }
};


export async function toggleScheduleStatus(req, res){
    try {
        if(req.user == null){
            return res.status(403).json({message:"Unauthorized!"});
        }

        const { id } = req.params;
        const schedule = await Schedule.findById(id);
        if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
  
        schedule.isEnabled = !schedule.isEnabled;
        await schedule.save();
  
        res.status(200).json({ message: `Schedule ${schedule.isEnabled ? 'enabled' : 'disabled'}`, schedule });
    } catch (err) {
        res.status(500).json({ message: 'Failed to toggle schedule status' });
    }
};
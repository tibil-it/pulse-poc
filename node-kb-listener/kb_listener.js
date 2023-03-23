const {getPoolClient, query} = require("./lib/pg_client");

const listenPref = async (prefRecord) => {
    const _client = await getPoolClient();
    await _client.query(`LISTEN ${prefRecord.pusher_topic};`);
     console.log(`started listening @ channel: ${prefRecord.pusher_topic}`);

    _client.on('notification', async msg => {
        try {
            let kbMainPayload = JSON.parse(msg.payload);
            let taskData = JSON.parse(kbMainPayload.data);
            // console.log("taskData", taskData);

            if (kbMainPayload.event_name === 'task.move.column') {
                let queryRes = await query(`SELECT * FROM user_tasks WHERE user_pid=${taskData.task.owner_id} AND project_pid=${taskData.task.project_id} 
                AND task_pid=${taskData.task_id};`);

                if (queryRes.rowCount === 0) {
                    await query(`INSERT INTO user_tasks (user_pid, project_pid, task_pid, task_status) VALUES ($1, $2, $3, $4);`,
                    [taskData.task.owner_id, taskData.task.project_id, taskData.task_id, taskData.task.column_id]);
                }

                if (taskData.task.column_title === 'Work in progress') {
                    await query(`UPDATE user_tasks SET start_time=CURRENT_TIMESTAMP WHERE user_pid=${taskData.task.owner_id} AND project_pid=${taskData.task.project_id} 
                    AND task_pid=${taskData.task_id};`);

                } else if (taskData.task.column_title === 'Done') {
                    let updateQry = `
                    WITH diff AS (
                        SELECT (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - start_time)))::integer as result
                        FROM public.user_tasks
                        WHERE user_pid=${taskData.task.owner_id} AND project_pid=${taskData.task.project_id} 
                        AND task_pid=${taskData.task_id}
                    )
                    UPDATE user_tasks SET time_spent=(select result from diff), end_time=CURRENT_TIMESTAMP WHERE user_pid=${taskData.task.owner_id} AND project_pid=${taskData.task.project_id} 
                    AND task_pid=${taskData.task_id};
                    `
                    await query(updateQry);
                }
                                    
            } else if (kbMainPayload.event_name === 'task.create' && taskData.task.owner_id) {

                await query(`INSERT INTO user_tasks (user_pid, project_pid, task_pid, task_status) VALUES ($1, $2, $3, $4);`,
                [taskData.task.owner_id, taskData.task.project_id, taskData.task_id, taskData.task.column_id]);

                if (taskData.task.column_title === 'Work in progress') {
                    await query(`UPDATE user_tasks SET start_time=CURRENT_TIMESTAMP WHERE user_pid=${taskData.task.owner_id} AND project_pid=${taskData.task.project_id} 
                    AND task_pid=${taskData.task_id};`);
                }
            }
        }
        catch (e) {
            console.error(e);
            console.error(`for message: ${JSON.stringify(msg.payload)}`);
        }
    });
};

module.exports = {
    listenPref
};

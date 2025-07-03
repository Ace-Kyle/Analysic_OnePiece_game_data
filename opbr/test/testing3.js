import JSON_DATA from "../io/json_data.js";
import Medal from "../model/medal/medal.js";

function calculateMemoryUsage() {
    printMemoryUsageNow() //before create many objects
    const MEDALS = JSON_DATA.listOf(JSON_DATA.TYPE.MEDAL);
    let containers = [];
    MEDALS.forEach(medal => {
        // Simulate some processing on each medal
        containers.push(new Medal(medal['medal_id']));
    });
    printMemoryUsageNow() //after create many objects

}
function printMemoryUsageNow() {
    const memoryUsage = process.memoryUsage();
    const result = {
        rss: (memoryUsage.rss / 1024 / 1024).toFixed(2) + ' MB',
        heapTotal: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
        heapUsed: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
        external: (memoryUsage.external / 1024 / 1024).toFixed(2) + ' MB'
    };
    console.table(result);
}

calculateMemoryUsage()
var stats = require('./stats');

/**
 * CMD WORKFLOW
 */
if (process.argv[2]) {

    if (process.argv[2] == "stats:send") {
        stats.sendWeeklyStats();
        setTimeout(function() {
            process.exit(1000);
        }, 10000);
    }

}
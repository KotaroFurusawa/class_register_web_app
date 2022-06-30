const fs = require('fs');

class logger {
    constructor(u_id) {
        this.u_id = u_id;
    }

    //ログ作成開始
    async start_log(message) {
        let msg = await this.mk_msg_tag(message);
        await fs.writeFileSync(__dirname + `/../execute_log/log_${this.u_id}.txt`, msg);
    }

    //成功ログ
    async info(message) {
        let msg = await this.mk_msg_tag(message, "INFO");
        await fs.appendFileSync(__dirname + `/../execute_log/log_${this.u_id}.txt`, msg);
    }

    //失敗ログ
    async fatal(message) {
        let msg = await this.mk_msg_tag(message, "ERROR");
        await fs.appendFileSync(__dirname + `/../execute_log/log_${this.u_id}.txt`, msg);
    }

    //ログhtml作成
    async mk_msg_tag(message, mode = "INFO") {
        let text_color = "";
        let status = "";
        if (mode === "INFO") {
            text_color = "#00ff00";
            status = "INFO";
        } else {
            text_color = "#ff1493";
            status = "ERROR";
        }
        return `<p class="mx-3" style="color:${text_color}">${(new Date()).toISOString()}[${status}]  :${message}</p>`;
    }
};

module.exports.logger = logger;
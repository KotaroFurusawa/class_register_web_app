class screenAction {
    constructor(page, logger) {
        this.page = page;
        this.logger = logger;
    }

    //urlでページ遷移
    async page_goto(url) {
        try {
            await this.page.goto(url, { waitUntil: 'networkidle2' });
        } catch (e) {
            this.logger.fatal(e);
            this.logger.fatal('申請失敗：この申請からやり直してください');
            process.exit(1);
        }
    }

    //座標指定でクリック
    async mouse_click(x, y, time) {
        try {
            await Promise.all([
                this.page.mouse.move(x, y),
                this.page.waitForTimeout(time),
                this.page.mouse.click(x, y)
            ]);
            return true;
        } catch (e) {
            var message = 'mouse_click_error:';
            this.logger.fatal(message + e);
            this.logger.fatal('申請失敗：この申請からやり直してください');
            process.exit(1);
        }
    }

    //Xpathでinputへ入力
    async xpath_type(elem, value) {
        try {
            await this.page.waitForXPath(elem);
            let xpath = await this.page.$x(elem);
            await xpath[0].focus()
            await xpath[0].type(value);
            return true;
        } catch (e) {
            var message = 'input_error:';
            this.logger.fatal(message + e);
            this.logger.fatal('申請失敗：この申請からやり直してください');
            process.exit(1);
        }
    }

    //Xpathでクリック
    async xpath_click(elem, options = {}) {
        await this.page.waitForXPath(elem);
        var xpath = await this.page.$x(elem);
        await xpath[0].click(options);
        await this.page.waitForTimeout(1000);
    }

    //xpathで存在チェック
    async xpath_existence_check(elem) {
        var xpath = await this.page.$x(elem);
        if (xpath[0] == undefined) {
            return false;
        } else {
            return true;
        }
    }

    //Xpathでinputの入力を初期化
    async xpath_text_clear(elem, leng) {
        let id_length = await String(leng).length;
        await this.xpath_click(elem);//serviceID入力欄をクリック
        for (let i = 0; i < id_length; i++) {
            await this.page.keyboard.press('Backspace');//入力欄をバックスペースにより初期化
        }
    }

    //xpathからテキスト取得
    async xpath_fetch_text(elem) {
        let elementHandle = await this.page.$x(elem);
        let text = await this.page.evaluate((path) => { //一括承認画面の先頭にある端末の端末管理番号を取得
            return path.textContent;
        }, elementHandle[0]);
        return text;
    }

    //子要素カウント
    async child_count_xpath(root_xpath) {
        //xpathをlist_pathとelemに分割する
        let sep = await root_xpath.lastIndexOf('/');
        let list_path = await root_xpath.substr(0, sep);
        let elem = await root_xpath.substr(sep + 1, root_xpath.length)
        return await this.child_count(list_path, elem)
    }

    async child_count(list_path, elem = 'div') {
        var item = await (await this.page.$x(list_path))[0];
        return await item.$eval(elem, element => element.childElementCount);//子要素のカウント
    }

    async mk_date(year, month, day) {
        let new_month = await this.double_digit(month);
        let new_day = await this.double_digit(day);
        return `${year}/${new_month}/${new_day}`;
    }

    async double_digit(num) {
        if (num.length == 1) {
            return '0' + num;
        } else {
            return num;
        }
    }

    //該当の文字を含む選択肢をクリック
    async text_search_click(xpath_set, string) {
        try {
            var exist_flag = false;
            let list_xpath = xpath_set.LIST;
            let children = await this.child_count_xpath(list_xpath);
            for (let i = 1; i <= children; i++) {
                let text_xpath = `${list_xpath}/div[${i}]${xpath_set.TEXT}`;
                let select_xpath = `${list_xpath}/div[${i}]${xpath_set.SELECT}`;
                let text = await this.xpath_fetch_text(text_xpath);

                if (text == string) {
                    await this.xpath_click(select_xpath);
                    exist_flag = true;
                    break;
                }

            }
            if (!exist_flag) {
                await this.logger.fatal(string + 'は存在しません');
                return false;
            } else {
                return true;
            }
        } catch (e) {
            var message = 'text_search_click_error:';
            this.logger.fatal(message + e);
            process.exit(1);
        }
    }
};

module.exports.screenAction = screenAction;

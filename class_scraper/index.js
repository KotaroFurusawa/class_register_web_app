const puppeteer = require('puppeteer');
const firm = require(__dirname + "/setting_data/_firm_data.json");

exports.class_register = async (info, schedule, user) => {
    const browser = await puppeteer.launch(firm.OPTION);
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'ja-JP' //日本語版ページが読み込まれるようにする
    });
    const xpath = firm.XPATH;
    const text = info;
    const schedule_set = schedule;

    const mk_logger = require(__dirname + "/logger.js");
    const logger = new mk_logger.logger(user.id);
    const screen_action = require(__dirname + "/action.js");
    const action = new screen_action.screenAction(page, logger);
    const schedule_list = schedule_set.SCHEDULE;

    //ログファイルの作成
    await logger.start_log('一括申請実行_開始');

    try {
        let i = 1;
        for (let schedule of schedule_list) {
            let class_room = await schedule.CLASS_ROOM.split("-");
            let date = await action.mk_date(schedule_set.YEAR, schedule_set.MONTH, schedule.DAY);
            let building_name = await firm.TEXT_CHANGE[class_room[0]].NAME; //使用施設名
            let class_room_name = await `${firm.TEXT_CHANGE[class_room[0]].ROOM_SELECT}-${class_room[1]}`; //使用教室名
            let time = await schedule.TIME;

            await action.page_goto(schedule_set.FORM_URL); //申請フォームへ遷移
            await logger.info(`【申請${i}】フォームアクセス成功`);
            await page.waitForTimeout(2000); //2秒待つ

            await action.xpath_type(xpath.CLUB_NAME, text.CLUB_NAME); //課外活動団体名入力
            await action.xpath_type(xpath.REPRESENT_NAME, text.REPRESENT_NAME); //申請者氏名入力
            await action.xpath_type(xpath.STUDENT_NUMBER, text.STUDENT_NUMBER); //学生番号入力

            await action.xpath_click(xpath.GUIDE_CONF); //「課外活動ガイドライン」と「使用可能施設一覧・申請方法」読んだ？
            await action.xpath_click(xpath.AVAILABILITY_CONF); //空き情報確認した？

            await action.text_search_click(xpath.BUILDING_SET, building_name); //使用希望施設選択

            await page.waitForTimeout(1000); //1秒待つ
            await action.text_search_click(xpath.CLASS_ROOM_SET, class_room_name); //使用希望施設選択

            await page.waitForTimeout(1000); //1秒待つ
            await action.xpath_type(xpath.DATE_INPUT, date); //日付入力
            await action.xpath_type(xpath.TIME, time); //時間入力
            await action.xpath_click(xpath.OUT_CAMPUS); //学外団体との合同使用の有無

            await page.waitForTimeout(1000); //1秒待つ
            await action.xpath_type(xpath.NOTICES, schedule.NOTICES); //特記事項入力
            await action.xpath_type(xpath.MAIL, text.MAIL); //メールアドレス入力
            await action.xpath_type(xpath.TEL, text.TEL); //電話番号入力

            await logger.info(`【申請${i}】・日付: ${date}, 時刻: ${time}, 利用施設: ${class_room_name}`);

            /*
            await Promise.all([
                page.waitForXPath('//span[contains(text(), "ありがとうございます")]'), //送信完了を確認するまで待つ
                action.xpath_click(xpath.SUBMIT) //フォームを送信する
            ])
            */

            await logger.info(`【申請${i}】フォーム送信成功`);
            i += 1;
        }
        await logger.info('一括申請実行_完了');
    } catch (e) {
        await logger.fatal(e)
    } finally {
        await browser.close();
    }

}
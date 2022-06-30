const reg_exp = {//正規表現とエラーメッセージ
    "CLUB_NAME": [".*", ""],
    "REPRESENT_NAME": [".+　.+", "＊姓と名の間に全角スペースを入れてください"],
    "STUDENT_NUMBER": ["^[ABCDE][0-9]{7}$", "＊学生番号を半角で正しく入力してください"],
    "MAIL": [".+@.+", "＊メールアドレスを正しく入力してください"],
    "TEL": [/^0\d{2,3}-\d{1,4}-\d{4}$/, "＊電話番号(ハイフンあり)を半角で正しく入力してください"],
    "FORM_URL": [/https?:\/\/[\w!?/+\-_~;.,*&@#$%()'[\]]+/, "＊URLを正しく入力してください"],
    "YEAR": ["^[0-9]{4}$", "＊年を半角数字で入力してください(ex:2022年なら「2022」)"],
    "MONTH": ["^[1-9]|1[0-2]$", "＊月を半角数字で入力してください(ex:6月なら「6」)"],
    "DAY": ["^[1-9]|[1-2][0-9]|3[0-1]$", "＊注意事項に従い、正しく入力してください"],
    "CLASS_ROOM": [/^(1|11|14|k)-/, "＊注意事項に従い、正しく入力してください"],
    "TIME": ["^([0-9]|1[0-9]|2[0-3]):[0-5][0-9]$", "＊注意事項に従い、正しく入力してください"]
}
const URL = location.protocol + '//' + location.host;

function add_list() {
    //申請リストの追加
    let request_list = document.getElementById('request_list');
    let i = request_list.childElementCount + 1;
    request_list.insertAdjacentHTML('beforeend', `<div id="list_${i}" class="border rounded p-3"><h3>${i}.</h3><div class="mb-3"><div class="mb-3"><div class="row"><div class="col-auto"><input type="text" id="day_${i}" class="form-control" name="申請日"placeholder="申請日" value="" required><p class="text-danger"></p></div><div class="col-auto"><input type="text" id="class_${i}" class="form-control" name="教室名"placeholder="教室名" value="" required><p class="text-danger"></p></div></div></div><div class="mb-3"><div class="row"><div class="col-auto"><input type="text" id="start_${i}" class="form-control" name="開始時刻"placeholder="開始時刻(H:mm)" value="" required><p class="text-danger"></p></div><div class="col-auto"><input type="text" id="finish_${i}" class="form-control" name="終了時刻"placeholder="終了時刻(H:mm)" value="" required><p class="text-danger"></p></div></div></div><div class="mb-3"><input type="text" id="notice_${i}" class="form-control" name="特記事項"placeholder="特記事項(空欄可)" value=""></div></div></div>`);
}

function copy_list() {
    //前の申請リストをコピーし追加
    let request_list = document.getElementById('request_list');
    let elm_size = request_list.childElementCount;

    //前の申請リストの入力値を取得
    let class_name = document.getElementById(`class_${elm_size}`).value;
    let start_time = document.getElementById(`start_${elm_size}`).value;
    let finish_time = document.getElementById(`finish_${elm_size}`).value;
    let notice = document.getElementById(`notice_${elm_size}`).value;

    let i = elm_size + 1;

    request_list.insertAdjacentHTML('beforeend', `<div id="list_${i}" class="border rounded p-3"><h3>${i}.</h3><div class="mb-3"><div class="mb-3"><div class="row"><div class="col-auto"><input type="text" id="day_${i}" class="form-control" name="申請日"placeholder="申請日" value="" required><p class="text-danger"></p></div><div class="col-auto"><input type="text" id="class_${i}" class="form-control" name="教室名"placeholder="教室名" value="${class_name}" required><p class="text-danger"></p></div></div></div><div class="mb-3"><div class="row"><div class="col-auto"><input type="text" id="start_${i}" class="form-control" name="開始時刻"placeholder="開始時刻(H:mm)" value="${start_time}" required><p class="text-danger"></p></div><div class="col-auto"><input type="text" id="finish_${i}" class="form-control" name="終了時刻"placeholder="終了時刻(H:mm)" value="${finish_time}" required><p class="text-danger"></p></div></div></div><div class="mb-3"><input type="text" id="notice_${i}" class="form-control" name="特記事項"placeholder="特記事項(空欄可)" value="${notice}"></div></div></div>`);
}

function delete_list() {
    //前の申請リストを削除
    let request_list = document.getElementById('request_list');
    let elm_size = request_list.childElementCount;
    if (elm_size == 1) {
        window.alert('申請は最低ひとつ必要です。');
    } else {
        let checkFlg = window.confirm(`申請${elm_size}を削除してもよろしいですか？`);

        if (checkFlg) {
            document.getElementById(`list_${elm_size}`).remove();
        }
    }
}


//フォームの内容を検証し，リクエスト
async function execute() {
    let data = {};
    let er_elem = await document.getElementById('request_error');
    //await e.preventDefault();//フォームの送信キャンセル
    const formElements = await document.forms.request_form;
    //クラブ情報の連想配列化
    let club_data = await club_info(formElements);

    //申請情報の連想配列化
    let request_data = await request_info(formElements);

    //規約の同意確認
    let rule_agree = await rule_agree_check(formElements);

    if (club_data != false && request_data != false && rule_agree != false) {
        er_elem.innerHTML = "";
        data.INFO = await club_data;//クラブ情報の追加
        data.REQUEST = await request_data;//申請情報の追加

        //postリクエスト
        await fetch(URL + '/execute', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)  // リクエスト本文にJSON形式の文字列を設定
        });
        window.onbeforeunload = null;
        window.location.href = URL + '/log_display';
    } else {
        er_elem.innerHTML = "＊１つ以上の入力エラーがあります。<br>修正し、再度送信ボタンを押下してください。";
    }
}

//規約の同意確認
async function rule_agree_check(formElements) {
    let flg = true;
    let rule_flg = formElements.rule.checked;
    let class_check_flg = formElements.class_check.checked;
    let rule_alert = await document.getElementById("rule_alert");
    let class_check_alert = await document.getElementById("class_check_alert");

    if (rule_flg) {
        rule_alert.innerHTML = ""
    } else {
        rule_alert.innerHTML = "＊「課外活動ガイドライン」と「使用可能施設一覧・申請方法」を読んで、チェックしてください。"
        flg *= false;
    }

    if (class_check_flg) {
        class_check_alert.innerHTML = ""
    } else {
        class_check_alert.innerHTML = "＊空き状況を確認して、チェックしてください。"
        flg *= false;
    }
    return flg;
}


//申請情報の連想配列化
async function request_info(formElements) {
    let flg = true;
    let request_data = {};
    let items = await check_items();//申請リストの入力チェック

    request_data.FORM_URL = await formElements.url.value;
    request_data.YEAR = await formElements.year.value;
    request_data.MONTH = await formElements.month.value;

    flg *= await form_bulk_check(request_data, "request_info");//URL，年，月のチェック

    if (items == false) {
        flg *= false;
    } else {
        request_data.SCHEDULE = items;
    }

    if (flg) {
        return request_data;
    } else {
        return false;
    }

}

//申請リストの入力チェック
async function check_items() {
    let flg = true;
    let request_items = [];
    let request_list = await document.getElementById('request_list');
    let elm_size = await request_list.childElementCount;

    for (let j = 1; j <= elm_size; j++) {
        let item = await check_item(j);//各申請の入力チェック
        if (item == false) {
            flg *= item;
        } else {
            await request_items.push(item);
        }
    }

    if (flg) {
        return request_items;
    } else {
        return false;
    }
}

//各申請の入力チェック
async function check_item(j) {
    let flg = true;
    let requests = {};
    let day_elem = await document.getElementById(`day_${j}`);
    let class_elem = await document.getElementById(`class_${j}`);
    let start_elem = await document.getElementById(`start_${j}`);
    let finish_elem = await document.getElementById(`finish_${j}`);
    let notices_elem = await document.getElementById(`notice_${j}`);

    requests.DAY = await day_elem.value;
    requests.CLASS_ROOM = await class_elem.value;
    requests.TIME = await `${start_elem.value}〜${finish_elem.value}`;
    requests.NOTICES = await notices_elem.value;

    flg *= await form_check(day_elem.value, "DAY", day_elem.parentNode.querySelector('p'));//dayチェックx
    flg *= await form_check(class_elem.value, "CLASS_ROOM", class_elem.parentNode.querySelector('p'));//classチェック
    flg *= await form_check(start_elem.value, "TIME", start_elem.parentNode.querySelector('p'));//start_timeチェック
    flg *= await form_check(finish_elem.value, "TIME", finish_elem.parentNode.querySelector('p'));//finish_timeチェック

    if (flg) {
        return requests;
    } else {
        return false;
    }
}

//クラブ情報の連想配列化
async function club_info(formElements) {
    let club_data = {};
    club_data.CLUB_NAME = await formElements.club.value;
    club_data.REPRESENT_NAME = await formElements.st_name.value;
    club_data.STUDENT_NUMBER = await formElements.st_num.value;
    club_data.MAIL = await formElements.mail.value;
    club_data.TEL = await formElements.tel.value;

    if (await form_bulk_check(club_data, "club_info")) {//フォーム入力一括チェック
        return club_data;
    } else {
        return false;
    }
}


//フォーム入力一括チェック
async function form_bulk_check(list, div_class) {
    let i = 1;
    let flg = true;
    for (key in list) {
        let elem = await document.querySelector(`div.${div_class} > div:nth-child(${i})>p`);//エラーメッセージ挿入用
        flg *= await form_check(list[key], key, elem);//入力フォームチェック
        i += 1;
    }
    return flg;
}

//入力フォームチェック(単体)
async function form_check(value, key, elem) {
    let flg = true;
    let regex = await new RegExp(reg_exp[key][0]);

    if (value === "") {//空白チェック
        elem.innerHTML = "＊入力必須項目です";
        flg *= false;
    } else {//ここの情報チェック
        if (await regex.test(value)) {//個別の入力書式確認
            elem.innerHTML = "";
            flg *= true;
        } else {//マッチしていなければ
            elem.innerHTML = `${reg_exp[key][1]}`;
            flg *= false;
        }
    }
    return flg;
}

document.addEventListener("DOMContentLoaded", function () {
    //リロード、ブラウザバックの警告
    window.onbeforeunload = function (e) {
        e.returnValue = "ページを離れようとしています。よろしいですか？";
    }

    //申請リスト追加
    document.getElementById("add_list").addEventListener("click", add_list);

    //前の申請リストのコピー
    document.getElementById("copy_list").addEventListener("click", copy_list);

    //前の申請リストの削除
    document.getElementById("delete_list").addEventListener("click", delete_list);

    //リクエストの送信
    document.getElementById("execute").addEventListener("click", execute);

});
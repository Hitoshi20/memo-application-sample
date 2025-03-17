const memoTextarea = document.getElementById('memo');
const saveButton = document.getElementById('save');
const loadButton = document.getElementById('load');

// Google Drive APIの初期化
function init() {
    gapi.client.init({
        apiKey: 'YOUR_API_KEY',
        clientId: 'YOUR_CLIENT_ID',
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
        scope: 'https://www.googleapis.com/auth/drive.file'
    }).then(() => {
        // 認証状態の確認
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    });
}

// 認証状態の更新
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        saveButton.onclick = saveMemo;
        loadButton.onclick = loadMemo;
    } else {
        gapi.auth2.getAuthInstance().signIn();
    }
}

// メモの保存
function saveMemo() {
    const fileData = new Blob([memoTextarea.value], {type: 'text/plain'});
    const fileMetadata = {
        'name': 'memo.txt',
        'mimeType': 'text/plain'
    };
    gapi.client.drive.files.create({
        resource: fileMetadata,
        media: {
            mimeType: 'text/plain',
            body: fileData
        }
    }).then(response => {
        console.log('保存完了', response);
    });
}

// メモの読み込み
function loadMemo() {
    gapi.client.drive.files.list({
        q: "name='memo.txt'",
        spaces: 'drive',
        fields: 'files(id, name)'
    }).then(response => {
        const files = response.result.files;
        if (files && files.length > 0) {
            const fileId = files[0].id;
            gapi.client.drive.files.get({
                fileId: fileId,
                alt: 'media'
            }).then(response => {
                memoTextarea.value = response.body;
            });
        } else {
            alert('メモが見つかりません');
        }
    });
}

// Google Drive APIの読み込み
function handleClientLoad() {
    gapi.load('client:auth2', init);
}

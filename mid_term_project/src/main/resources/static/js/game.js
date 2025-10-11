const MODE_NORMAL = 1, MODE_ENDLESS = 2;

(function(w) {
    function getJsonI18N() {
        // https://developer.mozilla.org/zh-CN/docs/Web/API/Navigator/language
        
        const LANGUAGES = [
            { regex: /^zh\b/, lang: 'zh' },
            { regex: /^ja\b/, lang: 'ja' },
            { regex: /.*/, lang: 'en'}
        ]

        const lang = LANGUAGES.find(l => l.regex.test(navigator.language)).lang
        
        return $.ajax({
            url: `../i18n/${lang}.json`,
            dataType: 'json',
            method: 'GET',
            async: false,
            success: data => res = data,
            error: () => alert('找不到语言文件: ' + lang)
        }).responseJSON
    }

    const I18N = getJsonI18N()

    $('[data-i18n]').each(function() {
        const content = I18N[this.dataset.i18n];
        $(this).text(content);
    });

    $('[data-placeholder-i18n]').each(function() {
        $(this).attr('placeholder', I18N[this.dataset.placeholderI18n]);
    });

    $('html').attr('lang', I18N['lang']);

    // 用现代 DOM API 插入样式
    const style = document.createElement('style');
    style.type = 'text/css';
    style.textContent =
        'html,body {font-size: 20px;}' +
        '#welcome,#GameTimeLayer,#GameLayerBG,#GameScoreLayer.SHADE{position: absolute;}';
    document.head.appendChild(style);
    let map = {'d': 0, 'f': 1, 'j': 2, 'k': 3};
    // 用现代 DOM API 插入游戏主体
    const gameBody = document.createElement('div');
    gameBody.id = 'gameBody';
    document.body.appendChild(gameBody);

    let body, blockSize, GameLayer = [],
        GameLayerBG, touchArea = [],
        GameTimeLayer;
    let transform, transitionDuration, welcomeLayerClosed;

    let mode = getMode();

    let soundMode = getSoundMode();

    w.init = function() {
        showWelcomeLayer();
        body = document.getElementById('gameBody') || document.body;
        body.style.height = window.innerHeight + 'px';
        transform = typeof (body.style.webkitTransform) != 'undefined' ? 'webkitTransform' : (typeof (body.style.msTransform) !=
        'undefined' ? 'msTransform' : 'transform');
        transitionDuration = transform.replace(/ransform/g, 'ransitionDuration');
        GameTimeLayer = document.getElementById('GameTimeLayer');
        GameLayer.push(document.getElementById('GameLayer1'));
        GameLayer[0].children = GameLayer[0].querySelectorAll('div');
        GameLayer.push(document.getElementById('GameLayer2'));
        GameLayer[1].children = GameLayer[1].querySelectorAll('div');
        GameLayerBG = document.getElementById('GameLayerBG');
            GameLayerBG.onmousedown = gameTapEvent;
        gameInit();
        initSetting();
        window.addEventListener('resize', refreshSize, false);
    }

    function getMode() {
        //有cookie优先返回cookie记录的，没有再返回normal
        return cookie('gameMode') ? parseInt(cookie('gameMode')) : MODE_NORMAL;
    }

    function getSoundMode() {
        // 默认为 on
        return cookie('soundMode') ? cookie('soundMode') : 'on';
    }

    w.changeSoundMode = function() {
        if (soundMode === 'on') {
            soundMode = 'off';
            $('#sound').text(I18N['sound-off']);
        } else {
            soundMode = 'on';
            $('#sound').text(I18N['sound-on']);
        }
        cookie('soundMode', soundMode);
    }

    function modeToString(m) {
        return m === MODE_NORMAL ? I18N['normal'] : I18N['endless'];
    }

    w.changeMode = function(m) {
        mode = m;
        cookie('gameMode', m);
        $('#mode').text(modeToString(m));
    }

    w.readyBtn = function() {
        closeWelcomeLayer();
        updatePanel();
    }

    w.winOpen = function() {
        window.open(location.href + '?r=' + Math.random(), 'nWin', 'height=500,width=320,toolbar=no,menubar=no,scrollbars=no');
        let opened = window.open('about:blank', '_self');
        opened.opener = null;
        opened.close();
    }

    let refreshSizeTime;

    function refreshSize() {
        clearTimeout(refreshSizeTime);
        refreshSizeTime = setTimeout(_refreshSize, 200);
    }

    function _refreshSize() {
        countBlockSize();
        for (let i = 0; i < GameLayer.length; i++) {
            let box = GameLayer[i];
            for (let j = 0; j < box.children.length; j++) {
                let r = box.children[j],
                    rstyle = r.style;
                rstyle.height = blockSize + 'px';
                rstyle.width = blockSize + 'px';
                rstyle.left = (j % 4) * blockSize + 'px';
                rstyle.bottom = Math.floor(j / 4) * blockSize + 'px';
            }
        }
        let f, a;
        if (GameLayer[0].y > GameLayer[1].y) {
            f = GameLayer[0];
            a = GameLayer[1];
        } else {
            f = GameLayer[1];
            a = GameLayer[0];
        }
        let y = ((_gameBBListIndex) % 10) * blockSize;
        f.y = y;
        f.style[transform] = 'translate3D(0,' + f.y + 'px,0)';
        a.y = -blockSize * Math.floor(f.children.length / 4) + y;
        a.style[transform] = 'translate3D(0,' + a.y + 'px,0)';
    }

    function countBlockSize() {
        blockSize = body.offsetWidth / 4;
        body.style.height = window.innerHeight + 'px';
        GameLayerBG.style.height = window.innerHeight + 'px';
        touchArea[0] = window.innerHeight;
        touchArea[1] = window.innerHeight - blockSize * 3;
    }

    let _gameBBList = [],
        _gameBBListIndex = 0,
        _gameOver = false,
        _gameStart = false,
        _gameSettingNum=20,
        _gameTime, _gameTimeNum, _gameScore, _date1, deviationTime;

    let _gameStartTime, _gameStartDatetime;

    function gameInit() {
        createjs.Sound.registerSound({
            src: "../music/err.mp3",
            id: "err"
        });
        createjs.Sound.registerSound({
            src: "../music/end.mp3",
            id: "end"
        });
        createjs.Sound.registerSound({
            src: "../music/tap.mp3",
            id: "tap"
        });
        gameRestart();
    }

    function gameRestart() {
        _gameBBList = [];
        _gameBBListIndex = 0;
        _gameScore = 0;
        _gameOver = false;
        _gameStart = false;
        _gameTimeNum = _gameSettingNum;
        _gameStartTime = 0;
        countBlockSize();
        refreshGameLayer(GameLayer[0]);
        refreshGameLayer(GameLayer[1], 1);
        updatePanel();
    }

    function gameStart() {
        _date1 = new Date();
        _gameStartDatetime = _date1.getTime();
        _gameStart = true;

        _gameTime = setInterval(timer, 1000);
    }

    function getCPS() {
        let cps = _gameScore / ((new Date().getTime() - _gameStartDatetime) / 1000);
        if (isNaN(cps) || cps === Infinity || _gameStartTime < 2) {
            cps = 0;
        }
        return cps;
    }

    function timer() {
        _gameTimeNum--;
        _gameStartTime++;
        if (mode === MODE_NORMAL && _gameTimeNum <= 0) {
            GameTimeLayer.innerHTML = I18N['time-up'] + '!';
            gameOver();
            GameLayerBG.className += ' flash';
            if (soundMode === 'on') {
                createjs.Sound.play("end");
            }
        }
        updatePanel();
    }

    function updatePanel() {
        if (mode === MODE_NORMAL) {
            if (!_gameOver) {
                GameTimeLayer.innerHTML = createTimeText(_gameTimeNum);
            }
        } else if (mode === MODE_ENDLESS) {
            let cps = getCPS();
            let text = (cps === 0 ? I18N['calculating'] : cps.toFixed(2));
            GameTimeLayer.innerHTML = `CPS:${text}`;
        } else {
            GameTimeLayer.innerHTML = `SCORE:${_gameScore}`;
        }
    }
    //使重试按钮获得焦点
    function foucusOnReplay(){
        $('#replay').focus()
    }

    function gameOver() {
        _gameOver = true;
        clearInterval(_gameTime);
        let cps = getCPS();
        updatePanel();
        setTimeout(function () {
            GameLayerBG.className = '';
            showGameScoreLayer(cps);
            foucusOnReplay();
        }, 1500);
    }


    function createTimeText(n) {
        return 'TIME:' + Math.ceil(n);
    }

    let _ttreg = / t{1,2}(\d+)/,
        _clearttClsReg = / t{1,2}\d+| bad/;

    let lastPrev = null;
    function refreshGameLayer(box, loop, offset) {
        let i = 0;
        if (lastPrev == null) {
            i += Math.floor(Math.random() * 1000) % 4;
        } else {
            let cellCount = [0, 1, 2, 3];
            let possible = cellCount.filter(c => c !== lastPrev);
            i = possible[Math.floor(Math.random() * possible.length)];
        }
        lastPrev = i;
        i += (loop ? 0 : 4);
        for (let j = 0; j < box.children.length; j++) {
            let r = box.children[j], rstyle = r.style;
            rstyle.left = (j % 4) * blockSize + 'px';
            rstyle.bottom = Math.floor(j / 4) * blockSize + 'px';
            rstyle.width = blockSize + 'px';
            rstyle.height = blockSize + 'px';
            r.className = r.className.replace(_clearttClsReg, '');
            if (i === j) {
                _gameBBList.push({
                    cell: i % 4,
                    id: r.id
                });
                r.className += ' t' + (Math.floor(Math.random() * 1000) % 5 + 1);
                r.notEmpty = true;
                i = (Math.floor(j / 4) + 1) * 4;
                let cellCount = [0, 1, 2, 3];
                let possible = cellCount.filter(c => c !== lastPrev);
                lastPrev = possible[Math.floor(Math.random() * possible.length)];
                i += lastPrev;
            } else {
                r.notEmpty = false;
            }
        }
        if (loop) {
            box.style.webkitTransitionDuration = '0ms';
            box.style.display = 'none';
            box.y = -blockSize * (Math.floor(box.children.length / 4) + (offset || 0)) * loop;
            setTimeout(function () {
                box.style[transform] = 'translate3D(0,' + box.y + 'px,0)';
                setTimeout(function () {
                    box.style.display = 'block';
                }, 100);
            }, 200);
        } else {
            box.y = 0;
            box.style[transform] = 'translate3D(0,' + box.y + 'px,0)';
        }
        box.style[transitionDuration] = '150ms';
    }

    function gameLayerMoveNextRow() {
        for (let i = 0; i < GameLayer.length; i++) {
            let g = GameLayer[i];
            g.y += blockSize;
            if (g.y > blockSize * (Math.floor(g.children.length / 4))) {
                refreshGameLayer(g, 1, -1);
            } else {
                g.style[transform] = 'translate3D(0,' + g.y + 'px,0)';
            }
        }
    }

    function gameTapEvent(e) {
        if (_gameOver) {
            return false;
        }
        let tar = e.target;
        let y = e.clientY || e.targetTouches[0].clientY,
            x = (e.clientX || e.targetTouches[0].clientX) - body.offsetLeft,
            p = _gameBBList[_gameBBListIndex];
        if (y > touchArea[0] || y < touchArea[1]) {
            return false;
        }
        if ((p.id === tar.id && tar.notEmpty) || (p.cell === 0 && x < blockSize) || (p.cell === 1 && x > blockSize && x < 2 *
            blockSize) || (p.cell === 2 && x > 2 * blockSize && x < 3 * blockSize) || (p.cell === 3 && x > 3 * blockSize)) {
            if (!_gameStart) {
                gameStart();
            }
            if (soundMode === 'on') {
                createjs.Sound.play("tap");
            }
            tar = document.getElementById(p.id);
            tar.className = tar.className.replace(_ttreg, ' tt$1');
            _gameBBListIndex++;
            _gameScore++;

            updatePanel();

            gameLayerMoveNextRow();
        } else if (_gameStart && !tar.notEmpty) {
            if (soundMode === 'on') {
                createjs.Sound.play("err");
            }
            tar.classList.add('bad');
            gameOver();
        }
        return false;
    }

    function createGameLayer() {
        let html = '<div id="GameLayerBG">';
        for (let i = 1; i <= 2; i++) {
            let id = 'GameLayer' + i;
            html += '<div id="' + id + '" class="GameLayer">';
            for (let j = 0; j < 10; j++) {
                for (let k = 0; k < 4; k++) {
                    html += '<div id="' + id + '-' + (k + j * 4) + '" num="' + (k + j * 4) + '" class="block' + (k ? ' bl' : '') +
                        '"></div>';
                }
            }
            html += '</div>';
        }
        html += '</div>';
        html += '<div id="GameTimeLayer" class="text-center"></div>';
        return html;
    }

    function closeWelcomeLayer() {
        welcomeLayerClosed = true;
        $('#welcome').css('display', 'none');
        updatePanel();
    }

    function showWelcomeLayer() {
        welcomeLayerClosed = false;
        $('#mode').text(modeToString(mode));
        $('#welcome').css('display', 'block');
    }

    function getBestScore(score) {
        let cookieName = (mode === MODE_NORMAL ? 'best-score' : 'endless-best-score');
        let best = cookie(cookieName) ? Math.max(parseFloat(cookie(cookieName)), score) : score;
        cookie(cookieName, best.toFixed(2), 100);
        return best;
    }

    function scoreToString(score) {
        return mode === MODE_ENDLESS ? score.toFixed(2) : score.toString();
    }

    function legalDeviationTime() {
        return deviationTime < (_gameSettingNum + 3) * 1000;
    }

    function showGameScoreLayer(cps) {
        let l = $('#GameScoreLayer');
        let idx = _gameBBListIndex - 1;
        if (idx < 0) idx = 0;
        if (idx >= _gameBBList.length) idx = _gameBBList.length - 1;
        let c = _gameBBList[idx] ? ($(`#${_gameBBList[idx].id}`).attr('class') || '').match(_ttreg) : null;
        c = c ? c[1] : '1';
        let score = (mode === MODE_ENDLESS ? cps : _gameScore);
        let best = getBestScore(score);
        l.attr('class', l.attr('class').replace(/bgc\d/, 'bgc' + c));
        let text = shareText(cps);
        $('#GameScoreLayer-text').html(text ? text : '成绩');
        let normalCond = legalDeviationTime() || mode !== MODE_NORMAL;
        l.css('color', normalCond ? '' : 'red');

        // 结算画面始终显示 CPS
        let finalCps = cps;
        if (typeof finalCps === 'undefined' || isNaN(finalCps) || finalCps === Infinity || finalCps < 0) {
            finalCps = getCPS();
        }
        $('#cps').text(finalCps && !isNaN(finalCps) ? finalCps.toFixed(2) : '0.00');
        $('#score').text(scoreToString(score));
        $('#GameScoreLayer-score').css('display', mode === MODE_ENDLESS ? 'none' : '');
        $('#best').text(scoreToString(best));

        l.css('display', 'block');
    }

    function hideGameScoreLayer() {
        $('#GameScoreLayer').css('display', 'none');
    }

    w.replayBtn = function() {
        gameRestart();
        hideGameScoreLayer();
    }

    w.backBtn = function() {
        gameRestart();
        hideGameScoreLayer();
        showWelcomeLayer();
    }

    function shareText(cps) {
        cps = Number(cps);
        if (mode === MODE_NORMAL) {
            const date1Time = _date1 ? _date1.getTime() : 0;
            deviationTime = new Date().getTime() - date1Time - _gameTimeNum * 1000;
            if (deviationTime > 500) {
                return I18N['text-level-6'];
            }
        }
    if (isNaN(cps) || cps === Infinity || cps < 0) return I18N['text-level-1'];
    if (cps <= 5) return I18N['text-level-1'];
    if (cps > 5 && cps <= 8) return I18N['text-level-2'];
    if (cps > 8 && cps <= 10) return I18N['text-level-3'];
    if (cps > 10 && cps <= 15) return I18N['text-level-4'];
    return I18N['text-level-5'];
    }

    function toStr(obj) {
        if (typeof obj === 'object') {
            return JSON.stringify(obj);
        } else {
            return obj;
        }
    }

    function cookie(name, value, time) {
        if (name) {
            if (value) {
                if (time) {
                    let date = new Date();
                    date.setTime(date.getTime() + 864e5 * time), time = date.toGMTString();
                }
                return document.cookie = name + "=" + escape(toStr(value)) + (time ? "; expires=" + time + (arguments[3] ?
                    "; path=" + arguments[3] + (arguments[4] ? "; domain=" + arguments[4] + (arguments[5] ? "; secure" : "") : "") : "") : ""), !0;
            }
            return value = document.cookie.match(RegExp("(^|;) ?" + name + "=([^;]*)(;|$)")), value ? unescape(value[2]) : "";
        }
        let data = {};
        value = document.cookie.replace(/\s/g, "").split(";");
        for (let i = 0; value.length > i; i++) data[value[i].split("=")[0]] = unescape(value[i].split("=")[1]);
        return data;
    }

    // 用现代 DOM API 插入游戏层
    gameBody.innerHTML += createGameLayer();

    function initSetting() {
        $("#username").val(cookie("username") ? cookie("username") : "");
        $("#message").val(cookie("message") ? cookie("message") : "");
        if (cookie("title")) {
            document.title = cookie("title");
            $("#title").val(cookie("title"));
        }
        let keyboard = cookie('keyboard');
        if (keyboard && keyboard.length === 4) {
            map = {};
            for (let i = 0; i < keyboard.length; i++) {
                map[keyboard[i].toLowerCase()] = i; // 0~3 编号
            }
            $('#keyboard').val(keyboard);
        } else {
            map = {'d': 0, 'f': 1, 'j': 2, 'k': 3};
        }
        // 重新绑定按键监听，确保 map 始终最新
        document.onkeydown = function (e) {
            let key = e.key.toLowerCase();
            if (key in map) {
                click(map[key]);
                e.preventDefault();
            }
        }
        if (cookie('gameTime')) {
            _gameSettingNum = parseInt(cookie('gameTime'));
            $('#gameTime').val(_gameSettingNum);
        }
    }

    w.show_btn = function() {
        $("#btn_group,#desc").css('display', 'block')
        $('#setting').css('display', 'none')
    }

    w.show_setting = function() {
        $('#btn_group,#desc').css('display', 'none')
        $('#setting').css('display', 'block')
        $('#sound').text(soundMode === 'on' ? I18N['sound-on'] : I18N['sound-off']);
    }

    w.save_cookie = function() {
        const settings = ['username', 'message', 'keyboard', 'title', 'gameTime'];
        for (let s of settings) {
            if ($(`#${s}`).val()) {
                cookie(s, $(`#${s}`).val());
            }
        }
        // 立即更新 map，确保新按键生效
        let keyboard = $('#keyboard').val();
        if (keyboard && keyboard.length === 4) {
            map = {};
            for (let i = 0; i < keyboard.length; i++) {
                map[keyboard[i].toLowerCase()] = i;
            }
        }
        initSetting();
    }

    function isnull(val) {
        let str = val.replace(/(^\s*)|(\s*$)/g, '');
        return str === '' || str === undefined || str == null;
    }

    function click(index) {
    if (!welcomeLayerClosed) return;
    let p = _gameBBList[_gameBBListIndex];
    if (!p) return;
    // index 是你按下的键（0~3），p.cell 是当前 note 的列
    if (index === p.cell) {
        // 正确，直接触发 gameTapEvent
        let fakeEvent = {
            clientX: ((index) * blockSize + (index + 1) * blockSize) / 2 + body.offsetLeft,
            clientY: (touchArea[0] + touchArea[1]) / 2,
            target: document.getElementById(p.id),
        };
        gameTapEvent(fakeEvent);
    } else {
        // 错误，触发错误判定
        let wrongId = p.id.substring(0, 11) + (parseInt($(`#${p.id}`).attr('num')) - p.cell + index);
        let fakeEvent = {
            clientX: ((index) * blockSize + (index + 1) * blockSize) / 2 + body.offsetLeft,
            clientY: (touchArea[0] + touchArea[1]) / 2,
            target: document.getElementById(wrongId),
        };
        gameTapEvent(fakeEvent);
    }
}

    const clickBeforeStyle = $('<style></style>');
    const clickAfterStyle = $('<style></style>');
    clickBeforeStyle.appendTo($(document.head));
    clickAfterStyle.appendTo($(document.head));

    function saveImage(dom, callback) {
        if (dom.files && dom.files[0]) {
            let reader = new FileReader();
            reader.onload = function() {
                callback(this.result);
            }
            reader.readAsDataURL(dom.files[0]);
        }
    }


    w.getClickBeforeImage = function() {
        $('#click-before-image').click();
    }

    w.saveClickBeforeImage = function() {
        const img = document.getElementById('click-before-image');
        saveImage(img, r => {
            clickBeforeStyle.html(`
                .t1, .t2, .t3, .t4, .t5 {
                   background-size: auto 100%;
                   background-image: url(${r});
            }`);
        })
    }

    w.getClickAfterImage = function() {
        $('#click-after-image').click();
    }

    w.saveClickAfterImage = function() {
        const img = document.getElementById('click-after-image');
        saveImage(img, r => {
            clickAfterStyle.html(`
                .tt1, .tt2, .tt3, .tt4, .tt5 {
                  background-size: auto 86%;
                  background-image: url(${r});
            }`);
        })
    }
}) (window);
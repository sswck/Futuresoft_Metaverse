// 미니게임 3종 설정 (PC / 모바일 위젯 크기 분기 포함)
const GAMES = {
    tidy: {
        file: "room-tidy.html",
        title: "🌤️ 오늘의 한 걸음 · 방 정돈",
        width: 960,
        height: 680,
        mWidth: 360,
        mHeight: 580,
    },
    miraesoft: {
        file: "miraesoft-launch.html",
        title: "🚀 미래소프트 · 게임 출시 대작전",
        width: 980,
        height: 680,
        mWidth: 360,
        mHeight: 580,
    },
    dripbag: {
        file: "dripbag-tycoon.html",
        title: "☕ 미래 제작소 · 드립백 공방",
        width: 1000,
        height: 700,
        mWidth: 360,
        mHeight: 580,
    },
};

// 위젯 닫기 공통 함수
function closePlayerWidget(player) {
    if (player.tag && player.tag.widget) {
        player.tag.widget.destroy();
        player.tag.widget = null;
        return true;
    }
    return false;
}

// 미니게임 실행 공통 함수
function startMiniGame(player, gameKey) {
    const game = GAMES[gameKey];
    if (!game) return;

    closePlayerWidget(player);

    if (!player.tag) {
        player.tag = {};
    }

    const w = player.isMobile ? game.mWidth : game.width;
    const h = player.isMobile ? game.mHeight : game.height;

    player.tag.widget = player.showWidget(game.file, "middle", w, h);
    player.sendMessage(`${game.title} 미니게임을 시작합니다! (종료: /닫기)`, 0xffd740);

    // 위젯 내부 통신 이벤트 수신
    player.tag.widget.onMessage.Add(function (player, data) {
        if (!data || !data.type) return;

        if (data.type === "CLOSE" || data.type === "TIDY_CLOSE") {
            closePlayerWidget(player);
        } else if (data.type === "TIDY_CLEAR") {
            player.tag.hasRoomKey = true;
            App.sayToAll(`🔑 ${player.name}님이 [방 정돈]을 마치고 현관 열쇠를 획득했습니다!`, 0x79d8b0);
        } else if (data.type === "DEV_CLEAR") {
            player.tag.miraesoftClear = true;
            App.sayToAll(`🚀 ${player.name}님이 [미래소프트: 게임 출시 대작전] 신작을 출시했습니다!`, 0x9b94ff);
        } else if (data.type === "DRIP_CLEAR") {
            player.tag.dripbagClear = true;
            App.sayToAll(
                `🎁 ${player.name}님이 [미래 제작소] 드립백 선물세트를 완성했습니다! (매출: ${(data.cash || 0).toLocaleString()}원)`,
                0x83c9f4,
            );
        }
    });
}

// 스페이스 입장 안내
App.onJoinPlayer.Add(function (player) {
    player.tag = {};
    player.sendMessage(
        "🎮 오브젝트 앞에서 [F] 키를 누르거나 채팅창에 [/방정리], [/미래소프트], [/드립백]을 입력해 보세요! (종료: /닫기)",
        0x79d8b0,
    );
});

// 맵 에디터 오브젝트 상호작용 (ZEP Script 상호작용 -> obj.param1 기준)
App.onObjectTouched.Add(function (sender, x, y, tileID, obj) {
    if (!obj) return;

    if (obj.type === ObjectEffectType.INTERACTION_WITH_ZEPSCRIPTS) {
        const val = String(obj.param1 || "").trim();

        if (val === "obj01" || val === "방정리") {
            startMiniGame(sender, "tidy");
        } else if (val === "obj02" || val === "미래소프트" || val === "게임제작") {
            startMiniGame(sender, "miraesoft");
        } else if (val === "obj03" || val === "드립백" || val === "제작소") {
            startMiniGame(sender, "dripbag");
        } else {
            sender.sendMessage(`[오브젝트 감지] 번호(text): "${obj.text}", 값(param1): "${val}"`, 0xff8888);
        }
    }
});

// 채팅 명령어 감지 (테스트 및 보조 실행용)
App.onSay.Add(function (player, text) {
    const cmd = text.trim();

    if (cmd === "/닫기" || cmd === "/종료") {
        if (closePlayerWidget(player)) {
            player.sendMessage("미니게임 창을 닫았습니다.", 0xffffff);
        } else {
            player.sendMessage("열려있는 미니게임이 없습니다.", 0xcccccc);
        }
        return;
    }

    if (cmd === "/방정리") startMiniGame(player, "tidy");
    else if (cmd === "/미래소프트" || cmd === "/게임제작") startMiniGame(player, "miraesoft");
    else if (cmd === "/드립백" || cmd === "/제작소") startMiniGame(player, "dripbag");
});

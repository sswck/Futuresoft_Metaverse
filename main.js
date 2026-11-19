// 미니게임 기본 설정 매핑
const GAMES = {
    tidy: {
        file: "room-tidy.html",
        title: "🌤️ 오늘의 한 걸음 · 방 정돈",
        width: 960,
        height: 680,
    },
    cafe: {
        file: "cafe-tycoon.html",
        title: "☕ 청춘 카페 타이쿤",
        width: 1020,
        height: 760,
    },
    dripbag: {
        file: "dripbag-tycoon.html",
        title: "📦 미래 제작소 (드립백 제조)",
        width: 1020,
        height: 740,
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

    player.tag.widget = player.showWidget(game.file, "middle", game.width, game.height);
    player.sendMessage(`${game.title} 미니게임을 시작합니다! (종료: /닫기)`, 0xffd740);

    // 위젯 내부 통신 이벤트 수신
    player.tag.widget.onMessage.Add(function (player, data) {
        if (!data || !data.type) return;

        if (data.type === "CLOSE" || data.type === "TIDY_CLOSE") {
            closePlayerWidget(player);
        } else if (data.type === "TIDY_CLEAR") {
            App.sayToAll(`🌤️ ${player.name}님이 [방 정돈]을 완료했습니다!`, 0x79d8b0);
        } else if (data.type === "CAFE_CLEAR") {
            App.sayToAll(`☕ ${player.name}님이 [청춘 카페] 영업을 마쳤습니다! (매출: ${data.cash || 0}원)`, 0xffad4e);
        } else if (data.type === "DRIP_CLEAR") {
            App.sayToAll(
                `📦 ${player.name}님이 [미래 제작소] 작업을 마쳤습니다! (매출: ${data.cash || 0}원)`,
                0x83c9f4,
            );
        }
    });
}

// 스페이스 입장 안내
App.onJoinPlayer.Add(function (player) {
    player.tag = {};
    player.sendMessage(
        "🎮 오브젝트 근처에서 [F] 키를 누르면 미니게임이 열립니다! (명령어: /방정리, /카페, /드립백, /닫기)",
        0x79d8b0,
    );
});

// 맵 에디터 오브젝트 상호작용 (정석 API 적용)
App.onObjectTouched.Add(function (sender, x, y, tileID, obj) {
    if (!obj) return;

    // ZEP Script 상호작용 오브젝트인 경우
    if (obj.type === ObjectEffectType.INTERACTION_WITH_ZEPSCRIPTS) {
        // 맵 에디터의 [값] 필드는 obj.param1로 들어옵니다.
        const val = String(obj.param1 || "").trim();

        if (val === "obj01" || val === "방정리") {
            startMiniGame(sender, "tidy");
        } else if (val === "obj02" || val === "카페") {
            startMiniGame(sender, "cafe");
        } else if (val === "obj03" || val === "드립백" || val === "제작소") {
            startMiniGame(sender, "dripbag");
        } else {
            // 다른 값이거나 비어있는 경우 디버깅 메시지
            sender.sendMessage(`[오브젝트 감지] 번호(text): "${obj.text}", 값(param1): "${val}"`, 0xff8888);
        }
    }
});

// 채팅 명령어 감지 (보조 실행용)
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
    else if (cmd === "/카페") startMiniGame(player, "cafe");
    else if (cmd === "/드립백" || cmd === "/제작소") startMiniGame(player, "dripbag");
});

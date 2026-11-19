// 플레이어가 스페이스에 입장할 때 안내 메시지 출력
App.onJoinPlayer.add(function (player) {
    player.sendMessage("💡 채팅창에 '/지뢰찾기'를 입력하면 미니게임 화면 테스트가 가능합니다!", 0xffff00);
});

// 채팅 명령어로 미니게임 위젯 호출
App.onSay.add(function (player, text) {
    if (text === "/지뢰찾기") {
        // 이미 열려있는 위젯이 있다면 닫기
        if (player.tag && player.tag.widget) {
            player.tag.widget.destroy();
            player.tag.widget = null;
        }

        // 화면 중앙(middle)에 350x420 크기로 HTML 위젯 띄우기
        player.tag = {};
        player.tag.widget = player.showWidget("minesweeper.html", "middle", 350, 420);

        // HTML 위젯에서 보낸 메시지(클리어, 닫기) 수신 처리
        player.tag.widget.onMessage.add(function (player, data) {
            if (data.type === "CLOSE") {
                player.tag.widget.destroy();
                player.tag.widget = null;
            } else if (data.type === "CLEAR") {
                // 전체 유저에게 클리어 알림 띄우기
                App.sayToAll(`🎉 ${player.name}님이 미니 지뢰찾기를 클리어했습니다!`, 0x00ff00);
                player.tag.widget.destroy();
                player.tag.widget = null;
            }
        });
    }
});

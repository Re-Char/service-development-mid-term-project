// 游戏 API 调用封装

const GameAPI = {
    /**
     * 获取用户游戏配置
     */
    async getConfig() {
        try {
            const response = await $.ajax({
                url: '/api/game/config',
                method: 'GET',
                dataType: 'json'
            });
            return response;
        } catch (error) {
            console.error('获取配置失败:', error);
            return null;
        }
    },

    /**
     * 保存用户游戏配置
     */
    async saveConfig(config) {
        try {
            const response = await $.ajax({
                url: '/api/game/config',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(config)
            });
            return response;
        } catch (error) {
            console.error('保存配置失败:', error);
            return null;
        }
    },

    /**
     * 保存游戏成绩
     */
    async saveScore(score, gameMode, cps) {
        console.log('API调用: saveScore', { score, gameMode, cps });
        try {
            // 无尽模式（gameMode=2）只保存 cps，不保存 score
            const requestData = {
                gameMode: gameMode,
                cps: cps
            };
            
            // 普通模式（gameMode=1）保存 score 和 cps
            if (gameMode === 1) {
                requestData.score = score;
            } else {
                // 无尽模式，将 cps 作为 score 存储
                requestData.score = Math.round(cps * 100);
            }
            
            const response = await $.ajax({
                url: '/api/game/score',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(requestData)
            });
            console.log('API响应: saveScore', response);
            return response;
        } catch (error) {
            console.error('保存成绩失败:', error);
            if (error.status === 401) {
                console.warn('用户未登录，无法保存成绩');
            }
            return null;
        }
    },

    /**
     * 获取最佳成绩
     */
    async getBestScore(gameMode) {
        try {
            const response = await $.ajax({
                url: '/api/game/best-score',
                method: 'GET',
                data: { gameMode: gameMode },
                dataType: 'json'
            });
            return response;
        } catch (error) {
            console.error('获取最佳成绩失败:', error);
            return null;
        }
    },

    /**
     * 获取历史成绩
     */
    async getHistory(gameMode) {
        try {
            const response = await $.ajax({
                url: '/api/game/history',
                method: 'GET',
                data: { gameMode: gameMode },
                dataType: 'json'
            });
            return response;
        } catch (error) {
            console.error('获取历史成绩失败:', error);
            return null;
        }
    }
};

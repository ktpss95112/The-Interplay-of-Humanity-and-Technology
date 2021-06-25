const app = Vue.createApp({
    data () {
        return {
            loggedIn: false,
            adminToken: '',
            taskID: null,
            tasks,
            userID: '',
        }
    },
    methods: {
        login () {
            const this_ = this;
            fetch(`${backend}/checkAdmin?admin_token=${encodeURI(this_.adminToken)}`, {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                },
            })
            .then((resp) => {
                if (!resp.ok) {
                    alert('錯誤');
                    throw new Error('resp not ok');
                }

                return resp.json();
            })
            .then(data => {
                this_.taskID = data.task_id;
                this_.loggedIn = true;

                // set cookie
                let now = new Date();
                now.setTime(now.getTime() + 24 * 3600 * 1000);
                document.cookie = `adminToken=${this_.adminToken}; expires=${now.toUTCString()}`;
                document.cookie = `taskID=${this_.taskID}; expires=${now.toUTCString()}`;
            })
            .catch(console.error);
        },
        logout () {
            this.loggedIn = false;
            this.adminToken = '';
            this.taskID = null;
        },
        finishTask () {
            const this_ = this;
            fetch(`${backend}/finish/task/${encodeURI(this_.taskID)}/user/${encodeURI(this_.userID)}?admin_token=${encodeURI(this_.adminToken)}`, {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                },
            })
            .then((resp) => {
                return resp.json();
            })
            .then(data => {
                if ('user_id' in data && 'task_id' in data && 'id' in data) {
                    alert('完成');
                }
                else {
                    alert(data.detail);
                }
            })
            .catch(console.error);
        },
        giveAward () {
            const this_ = this;
            fetch(`${backend}/award/user/${encodeURI(this_.userID)}?admin_token=${encodeURI(this_.adminToken)}`, {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                },
            })
            .then((resp) => {
                return resp.json();
            })
            .then(data => {
                if ('user_id' in data && 'is_awarded' in data) {
                    alert('成功兌換！');
                }
                else {
                    alert(data.detail);
                }
            })
            .catch(console.error);
        }
    },
    mounted () {
        // check if already logged in before
        if (document.cookie.split(';').some((item) => item.trim().startsWith('adminToken='))) {
            this.taskID = document.cookie.split('; ').find(row => row.startsWith('taskID')).split('=')[1];
            this.adminToken = document.cookie.split('; ').find(row => row.startsWith('adminToken')).split('=')[1];
            this.loggedIn = true;
        }

        // check if redirected from QR code reader
        if (window.location.hash) {
            this.userID = window.location.hash.substring(1);
        }
    }
});


app.mount('#app');

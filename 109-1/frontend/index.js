function setCSSVariable () {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
}

setCSSVariable();
window.addEventListener('resize', setCSSVariable);


const app = Vue.createApp({
    data () {
        return {
            tasks,
            showQRCode: false,
            userID: null,
            isAwarded: false,
            solve: [],
            showParentPhoto: false,
        }
    },
    methods: {
        getUserID (callback) {
            const this_ = this;
            fetch(`${backend}/users`, {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                },
            })
            .then((resp) => {
                if (!resp.ok) {
                    alert('無法連線至集點系統，請重新整理頁面再試一次。');
                    throw new Error('Cannot connect to backend serever.');
                }

                return resp.json();
            })
            .then(data => {
                this_.userID = data.user_id;
                this_.isAwarded = data.is_awarded;
            })
            .then(callback)
            .catch(console.error);
        },
        genQRCode () {
            // generate qrcode
            new QRCode(document.querySelector('#qrcode'), {
                text: `${adminURL}#${this.userID}`,
                width: 200,
                height: 200,
                colorDark: '#000000',
                colorLight: '#F2F1EF',
            });
            console.log(this.userID);
            this.updateStatus();
        },
        updateStatus () {
            const this_ = this;
            fetch(`${backend}/status/user/${this_.userID}`, {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                },
            })
            .then((resp) => {
                if (!resp.ok) {
                    throw new Error('Cannot update user status.');
                }

                return resp.json();
            })
            .then(data => {
                this_.userID = data.user_id;
                this_.solve = data.solve;
                this_.isAwarded = data.is_awarded;
            })
            .catch(console.error);
        }
    },
    mounted () {
        const this_ = this;

        // check if userID exists in cookie
        if (document.cookie.split(';').some((item) => item.trim().startsWith('userID='))) {
            this.userID = document.cookie.split('; ').find(row => row.startsWith('userID')).split('=')[1];
            this.genQRCode();
        }
        else {
            this.getUserID(() => {
                this_.genQRCode();

                // set cookie
                let now = new Date();
                now.setTime(now.getTime() + 24 * 3600 * 1000);
                document.cookie = `userID=${this_.userID}; expires=${now.toUTCString()}`;
            });
        }

        setInterval(() => {
            this_.updateStatus();
        }, 5000);
    }
});


app.component('main-content', {
    template: '#main-content-template',
    data () {
        return {
            tasks,
            currentState: 0,
        }
    },
    emits: ['show-parent-photo'],
});


app.component('select-item', {
    template: '#select-item-template',
    props: {
        item: Number,
    },
    data () {
        return {
            tasks
        }
    },
    emits: ['click-item']
});


app.component('parent-photo', {
    template: '#parent-photo-template',
    emits: ['close'],
});


app.mount('#app');

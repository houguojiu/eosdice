<template>
  <section class="game">
    <div class="form">
      <div class="form-group">
        <div>
          <label>BET AMOUNT</label>   
          <div class="input-amount-group">
            <div class="input-group">
              <img 
                class="eos-logo"
                :src="eosLogo" />
              <input 
                @change="checkBetamount"
                v-model="eos" />
            </div>
            <ul class="amount-rate">
              <li @click="setEOS(.5)">1/2</li> 
              <li @click="setEOS(2)">2X</li> 
              <li @click="setEOS()">MAX</li> 
            </ul>
          </div>
        </div> 
        <div>
          <label>PAYOUT ON WIN</label>
          <div class="bet-cell">
            <img 
              class="eos-logo"
              :src="eosLogo" />
            <span>{{payWin}}</span>
          </div> 
        </div>
      </div>
      <div class="info-container">
        <ul>
          <li>
            <label>ROLL UNDER TO WIN</label>
            <span>{{rollUnder}}</span>
          </li>
          <li>
            <label>PAYOUT</label>
            <span>{{Number(payOut).toFixed(2)}}x</span>
          </li>
          <li>
            <label>WIN CHANCE</label>
            <span>{{winChance}}%</span>
          </li>
        </ul> 
      </div>
      <footer class="game-footer">
        <div class="currenteos-container">
          <img 
            class="eos-lg"
            :src="eosLogo" />
          <span 
            :class="{
              'animateUp': this.showUpAnimation, 
              'animateDown': this.showDownAnimation
            }"
            class="eos-animation">{{animationTxt}}</span>
          <span>{{Number(currentEOS).toFixed(4)}}</span>
        </div>
        <el-button 
          v-if="account.name"
          @click="doTestAction"
          class="btn-action">{{actionTxt}}</el-button>
        <button 
          v-else
          @click="login"
          class="btn-action">LOGIN</button>
        <div class="bet-balance">
          <img 
            class="token-logo"
            :src="tokenLogo" />
          <span>0.0000</span>
        </div>
      </footer>
    </div>

    <dice-slider 
      :initial="rollUnder" 
      :max="96" 
      :min="2" />

    <el-dialog 
      width="30%"
      :visible.sync="showAbout">
      <p slot="title">How To Play</p>
      <ol>
        <li>1. Make sure you have an EOS account. For more information on how to create one, <a href="//medium.com/dapppub/create-your-own-eos-account-easily-using-the-non-service-fee-dapp-signupeoseos-b15c5347f2fc" target="_blank">click here</a>.</li>
        <li>2. If you haven’t already, download and install <a href="//get-scatter.com/" target="_blank">Scatter</a>, an EOS wallet that facilitates interaction between users and dApps.</li>
        <li>3. Set your BET AMOUNT. This is the amount of EOS you will be wagering.</li>
        <li>4. Adjust the slider to change your chance of winning.</li>
        <li>5. Click ROLL DICE to place your bet.</li>
        <li>6. If your number is lower than your ROLL UNDER TO WIN number, you win!</li>
        <li>7. If you get a notice that your transaction failed, please check that you have enough CPU & bandwidth to make the transaction! Please use <a href="//eostoolkit.io/home" target="_blank">EOSToolkit</a> to make any changes to your account!</li>
      </ol>
      <p>You can view your EOS balance next to the ROLL DICE button. The table below the slider bar shows recent bets from all players across the world.</p>
      <p>Still have questions? Reach out to us at <a href="//discordapp.com/channels/482077322070196225/487187255065313292" target="_blank">Discord</a> and we’ll be happy to help!</p>
    </el-dialog>
    
    <el-dialog
      :visible.sync="showSocial">
      <p slot="title">Join the EOSBet Community</p>
      <ul class="social-links">
        <li @click="navigate('twitter')">
          <font-awesome-icon :icon="['fab', 'twitter']" /> 
        </li>
        <li @click="navigate('github')">
          <font-awesome-icon :icon="['fab', 'github']" /> 
        </li>
        <li @click="navigate('medium')">
          <font-awesome-icon :icon="['fab', 'medium-m']" /> 
        </li>
        <li @click="navigate('discord')">
          <font-awesome-icon :icon="['fab', 'discord']" /> 
        </li>
      </ul>
    </el-dialog>
  </section> 
</template>

<script>
  import eosLogo from '@/assets/eos.png';
  import tokenLogo from '@/assets/bet-token.png';
  import Eos from 'eosjs';
  import eventHub from '@/utils/event';
  import network from '@/utils/network';
  import fetch from '@/utils/api';
  import api from '@/utils/eos';
  import createHash from 'create-hash';

  export default {
    mounted() {
      eventHub.$on('ROLLUNDER_CHANGE', rollUnder => this.rollUnder = rollUnder);
      eventHub.$on('SHOW_ABOUT', () => this.showAbout = true);
      eventHub.$on('SHOW_SOCIAL', () => this.showSocial = true);
      this.getEOS();
      this.getPool();
    },

    data() {
      return {
        eosLogo,
        tokenLogo,
        eos: 1,
        rollUnder: 50,
        currentEOS: 0,
        poolBalance: 0,
        timer: 0,
        animationTxt: 0,
        actionTxt: 'ROLL DICE',
        showAbout: false,
        showSocial: false,
        animating: false,
        showUpAnimation: false,
        showDownAnimation: false
      };
    },
    methods: {
    //   getAccountBalance() {
    //    let params = {"code":"eosio.token","account":"dicebet"}
    //     let res = await httpRequest.postRequest("http://127.0.0.1:8888/v1/chain/get_currency_balance", params)

    // },

    getCurBalance(){
          // alert(this.account.name)
            let params = {"code":"eosio.token","account":"dicebet"}
            let result 
            api.getCurrencyBalance("eosio.token","dicebet").then(function(res){
           //   alert("+++++++="+res);
            //  alert(typeof(res))
            //result = Number(JSON.stringify(res).replace(/\sEOS/, ''));
            result = res
            });
            alert("----------"+result)

        return result
            
           // alert(this.currentEOS)
    },


      getEOS() {
        if (!this.account.name) {
          this.currentEOS = 0;
          return;
        }
        return api.getAccount(this.account.name).then(({ core_liquid_balance }) => {
          alert(core_liquid_balance)

          this.currentEOS = Number(core_liquid_balance.replace(/\sSYS/, ''));
          //let result = this.getCurBalance();
          //alert("====="+result)

        });
      },

      getPool() {
        Promise.all([
          api.getTableRows({
            json: true,
            code: 'eosio.token',
            table: 'accounts',
            scope: 'eosio.token'
          }),
          api.getTableRows({
            json: true,
            code: 'fairdicegame',
            table: 'fundpool',
            scope: 'fairdicegame'
          })
        ]).then(([accountBalance, poolBalance]) => {
          // alert(JSON.stringify(accountBalance))
          // alert(JSON.stringify(poolBalance))

          //alert(JSON.stringify(accountBalance.rows.length))
          if(accountBalance.rows.length > 0){
            this.poolBalance = accountBalance.rows[0].balance.slice(0, -4) 
            - poolBalance.rows[0].locked.slice(0, -4);
          }
          
        });
      },

      floor(value, decimals) {
        return Number(Math.floor(value+'e'+decimals)+'e-'+decimals);
      },

      maxBetAmount() {
        return this.floor(this.poolBalance / 100 / (98 / this.winChance) * 0.9, 4);
      },

      setEOS(rate) {
        const { poolBalance, currentEOS } = this;
        let eos = rate ? this.eos * rate : this.currentEOS;
        switch (true) {
          case (eos < 0.1): 
            eos = 0.1;
            break;
          case (eos > currentEOS):
            eos = currentEOS;
            break;
          case (eos > this.maxBetAmount()):
            eos = this.maxBetAmount();
            break;
        }
        this.eos = Number(eos).toFixed(4);
      },

      getClientSeed() {
        let randomNumber = Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER));
        return createHash('sha1').update(this.account.name + Date.now() + randomNumber).digest('hex');
      },
      getServerSeed(){
        let randomNumber = Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER));
        return createHash('sha256').update(this.account.name + Date.now() + randomNumber).digest('hex');
      },

      doAction() {
        let maxAmount = this.maxBetAmount();
        alert(this.eos)
        alert("maxamount="+maxAmount)
        if (this.eos > maxAmount) {
          this.$notify({
            title: 'Bet Failed',
            message: 'Bet Amount should not be more than ' + maxAmount.toFixed(4) + ' EOS',
            duration: 2000,
            showClose: false,
            type: 'error'
          });
          return;
        }
        const minBetAmount = 0.1
        if (this.eos < minBetAmount) {
          this.$notify({
            title: 'Bet Failed',
            message: 'Bet Amount should be more than ' + minBetAmount.toFixed(4) + ' EOS',
            duration: 2000,
            showClose: false,
            type: 'error'
          });
          return;
        }
        const body = new FormData();
        const eos = scatter.eos(network, Eos, {})
        const options = {
          authorization: `${this.account.name}@${this.account.authority}`,
          broadcast: true,
          sign: true
        };

        this.showEOSAnimation = true;
        this.$message.info('Waiting for Scatter to confirm transfer...');
        let referrer = 'fairdicegame';  
        body.append('roll_under', this.rollUnder);
        body.append('referrer', referrer);
        
        fetch('//dice.dapp.pub/dice/', {
          method: 'POST',
          body 
        }).then(({ expiration_timestamp, seed, signature }) => {
          alert('user seed='+this.getClientSeed()+'expiration_timestamp==='+expiration_timestamp+"seed=="+seed+"signature"+signature);
          console.log('user seed='+this.getClientSeed()+'expiration_timestamp==='+expiration_timestamp+"seed=="+seed+"signature="+signature)

          eos.transfer({
            from: this.account.name, 
            to: 'fairdicegame',
            quantity: Number(this.eos).toFixed(4) + ' EOS',

            memo: `${this.rollUnder}-${seed}-${this.getClientSeed()}-${expiration_timestamp}-${referrer}-${signature}` 
          }).then(() => {
            this.getEOS(); 
            this.fetchResult(seed);
           // this.animating = true;

            this.$notify({
              title: 'Bet success',
              message: 'Waiting for bet result',
              duration: 2000,
              showClose: false,
              type: 'info'
            });
          }).catch(e => {
            this.$notify.error(e.message || JSON.parse(e).error.details[0].message);
          });
        });
      },

      doTestAction() {
        let maxAmount = this.maxBetAmount();
        alert(this.eos)
        alert("maxamount="+maxAmount)
        // if (this.eos > maxAmount) {
        //   this.$notify({
        //     title: 'Bet Failed',
        //     message: 'Bet Amount should not be more than ' + maxAmount.toFixed(4) + ' EOS',
        //     duration: 2000,
        //     showClose: false,
        //     type: 'error'
        //   });
        //   return;
        // }
        // const minBetAmount = 0.1
        // if (this.eos < minBetAmount) {
        //   this.$notify({
        //     title: 'Bet Failed',
        //     message: 'Bet Amount should be more than ' + minBetAmount.toFixed(4) + ' EOS',
        //     duration: 2000,
        //     showClose: false,
        //     type: 'error'
        //   });
        //   return;
        // }
        const body = new FormData();
        const eos = scatter.eos(network, Eos, {})
        const options = {
          authorization: `${this.account.name}@${this.account.authority}`,
          broadcast: true,
          sign: true
        };

        this.showEOSAnimation = true;
        this.$message.info('Waiting for Scatter to confirm transfer...');
        let referrer = 'fairdicegamb';  
        body.append('roll_under', this.rollUnder);
        body.append('referrer', referrer);
        alert(this.getServerSeed());
        fetch('//dice.dapp.pub/dice/', {
          method: 'POST',
          body 
        }).then(({ expiration_timestamp, seed, signature }) => {
          alert(this.rollUnder)
          alert(this.getClientSeed())
          referrer = "tester";
          var timestamp = '1541734006';
          timestamp = Date.parse(new Date());
          alert(referrer)
          signature ="SIG_K1_KXxcJkEn5faFWbWU27mHRk5ZFqbk9bN7D17wzaHjqLmf6nbspBzip1xSbS6A8uutVwNSXuZrfUwNZTWJHN1uVgprpLzHjp"
          alert(this.eos)
         //this.eos ="1.0000 SYS";
          alert("eos-------", Number(this.eos).toFixed(4));
          alert(`${this.rollUnder}-${this.getClientSeed()}-${this.getClientSeed()}-${timestamp}-${referrer}-${signature}` )
          console.log(`${this.rollUnder}-${this.getClientSeed()}-${this.getClientSeed()}-${timestamp}-${referrer}-${signature}` )
          eos.transfer({
            from: this.account.name, 
            to: 'fairdicegamd',
            //quantity: Number(this.eos).toFixed(4) + ' SYS',
            quantity: '1.0000 SYS',
            memo: `${this.rollUnder}-${this.getServerSeed()}-${this.getClientSeed()}-${timestamp}-${referrer}-${signature}` 

            //memo: `${this.rollUnder}-${seed}-${this.getClientSeed()}-${expiration_timestamp}-${referrer}-${signature}` 
          }).then(() => {
            alert("hahahahah");
            this.getEOS(); 
            this.fetchResult(seed);
            this.animating = true;

            this.$notify({
              title: 'Bet success',
              message: 'Waiting for bet result',
              duration: 2000,
              showClose: false,
              type: 'info'
            });
          }).catch(e => {
            this.$notify.error(e.message || JSON.parse(e).error.details[0].message);
          });
        });
      },

      fetchResult(hash) {
        api.getActions('fairdicelogs', -1, -20).then(({ actions }) => {
          const result = actions.find(action => action.action_trace
            && action.action_trace.act 
            && action.action_trace.act.account === 'fairdicelogs' 
            && action.action_trace.act.name === 'result'
            && action.action_trace.act.data
            && action.action_trace.act.data.result
            && action.action_trace.act.data.result.seed_hash === hash);  

          if (!result) return this.fetchResult(hash);

          const { action_trace: { act: { data: { result: { amount, payout } } } } } = result;

          if (payout === '0.0000 EOS') {
            this.showDownAnimation = true; 
            this.animationTxt = amount;
          } else {
            this.showUpAnimation = true;
            this.animationTxt = payout;
          }

          setTimeout(() => {
            this.showDownAnimation = false; 
            this.showUpAnimation = false;
          }, 3100);

          this.animating = false;
          this.getEOS();
        });
      },

      login() {
        scatter.getIdentity({
          accounts: [network]
        }).then(() => {
          const account = scatter.identity.accounts.find(account => account.blockchain === 'eos');
          if (!account) return;
          this.$store.commit('UPDATE_ACCOUNT', account);
        }).catch(e => {
          this.$message.warning(e.message);
        });
      },
      
      checkBetamount() {
      },

      navigate(brand) {
        switch (brand) {
          case 'twitter':
            window.open('//twitter.com/dappPub');
            break;
          case 'medium':
            window.open('//medium.com/dapppub');
            break;
          case 'github':
            window.open('//github.com/dappub');
            break;
          case 'discord':
            window.open('//discordapp.com/channels/482077322070196225/487187255065313292');
            break;
        }
      }
    },

    watch: {
      account() {
        this.getEOS();
      },
      animating() {
        const { animating } = this;
        if (!animating) {
          clearInterval(this.timer);
          this.actionTxt = 'ROLL DICE';
          return;
        }
        this.timer = setInterval(() => {
          this.actionTxt = (Math.random() * 100).toFixed(0);
        }, 100);
      }
    },
    components: {
      diceSlider: require('@/components/slider').default
    },
    computed: {
      winChance() {
        return this.rollUnder - 1;
      },

      payOut() {
        return 98 / this.winChance;
      },

      payWin() {
        return (this.eos * this.payOut).toFixed(4);
      },

      account() {
        return this.$store.state.account; 
      }
    }
  };
</script>

<style scoped>
  .game {
    background: url('../assets/bg.png') top left repeat;
    background-size: contain;
    padding: 60px 0;
  }

  .form {
    width: 655px;
    border-radius: 5px; 
    font-size: 18px;
    background-color: #4b4848;
    margin: 0 auto 20px auto;
    padding: 20px 30px;
  }

  .form-group {
    display: flex;
    align-items: center;
  }

  .form-group > div:last-child {
    flex: 1;
  }

  .amount-rate {
    display: flex;
    align-items: center;
  }

  .amount-rate li {
    color: #9b9fae;
    font-size: .6em;
    font-weight: 600;
  }

  .amount-rate li:not(:last-child) {
    border-right: 2px solid #2F2F2F;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    color: #9b9fae;
    font-weight: 600;
    font-size: .6em;
    margin-bottom: .75em;
    display: block;
  }

  .form-group input {
    text-align: center;
    border: none;
    padding: 10px 12px;
    borde-radius: .3em;
    font-weight: 600;
    letter-spacing: .2px;
    font-size: 18px;
    outline: none;
    background-color: #4b4848;
    width: 177px;
    color: #fff;
  }

  .input-amount-group {
    display: flex;
    align-items: center;
    background-color: #3f3e3e;
    padding: 2px;
    border-radius: .3em;    
    margin-right: 30px;
    height: 47px;
    position: relative;
  }

  .input-amount-group ul li {
    cursor: pointer;
    padding: 8px 15px;
  }

  .input-amount-group ul li:hover {
    background-color: #0000003f; 
  }

  .input-group {
    flex: 1;
  }

  .input-group input {
    padding-left: 15px;   
  }

  .input-group .eos-logo {
    position: absolute;
    left: 10px;
    top: 12.5px;
  }

  .info-container {
    background-color: #3F3E3E; 
    padding: 20px;
  }

  .info-container ul {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .info-container ul > li {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
  }

  .info-container ul > li:not(:last-child) {
    border-right: 2px solid #2F2F2F;
  }

  .info-container ul > li > label {
    color: #9b9fae;
    font-weight: 600;
    font-size: .6em;
    margin-bottom: .75em;
    display: block;
  }

  .info-container ul > li > span {
    color: #fff;
    font-size: 1.2em;
    font-weight: 600;
    letter-spacing: .5px;
  }

  .bet-cell {
    background-color: #3f3e3e;
    border-radius: .3em;
    height: 47px;
    line-height: 47px;
    text-align: center;
    position: relative;
  }

  .bet-cell > span {
    color: #fff;
    font-weight: 600;
  }

  .bet-cell .eos-logo {
    position: absolute;
    left: 10px;
    top: 12.5px;
  }

  .game-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 20px;
  } 

  .game-footer > div {
    flex: 1;
    text-align: center;
    color: #fff;
    font-weight: 600;
  }

  .btn-action {
    outline: none;
    letter-spacing: 3px;
    font-weight: 600;
    font-size: 18px;
    background-color: #0191ee;
    border-color: #0191ee;
    cursor: pointer; 
    padding: .5rem 1rem;
    line-height: 1.5;
    border-radius: .3rem;
    color: #fff;
    flex: 1;
  }

  .eos-logo {
    height: 22px;
  }

  .eos-lg {
    width: 22px;
    margin-right: 5px;
    vertical-align: middle;
  }

  .token-logo {
    width: 22px;
    vertical-align: middle;
    margin-right: 5px;
  }

  .game >>> .el-dialog {
    background-color: #4A4848;
  }

  .game >>> .el-dialog__header {
    font-weight: 700;
    text-align: center;
    line-height: 1.5;
    letter-spacing: .5px;
    color: #fff;
    font-size: 1.25em;
  }

  .game >>> .el-dialog__body {
    color: #fff;
    padding-top: 0;
    font-weight: 700;
    letter-spacing: .5px;
    color: #fff;
    font-size: 1em;
  }

  .game >>> .el-dialog__body li,
  .game >>> .el-dialog__body p {
    margin-bottom: 10px;
  }

  .game >>> .el-dialog__body a {
    color: #0191ee;
    text-decoration: none;
  }

  .game >>> .el-dialog__body a:hover {
    text-decoration: underline;
  }

  .social-links {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30px 30px 0 30px;  
    font-size: 1.2em;
  }

  .social-links li {
    border-radius: 50%;
    padding: 10px;
    cursor: pointer;
    transition: background-color ease 200ms;
  }

  .social-links li:hover {
    background-color: #6C2DED;
  }

  .bet-balance {
    visibility: hidden;
  }

  .currenteos-container {
    position: relative;
  }

  .eos-animation {
    opacity: 0;
    
    position: absolute;
  }

  .eos-animation.animateUp {
    animation: fadeOutUp 3s;
    color: #02f292; 
    text-shadow: 0 0 5px #02f292;
  }

  .eos-animation.animateDown {
    animation: fadeOutDown 1s;
    color: #CD4263;
    text-shadow: 0 0 5px #CD4263;
  }

  @keyframes fadeOutUp {
    from {
      opacity: 1;
    }

    to {
      opacity: 0;
      -webkit-transform: translate3d(0, -100%, 0);
      transform: translate3d(0, -100%, 0);
    }
  }

  @keyframes fadeOutDown {
    from {
      opacity: 1;
    }

    to {
      opacity: 0;
      -webkit-transform: translate3d(0, 100%, 0);
      transform: translate3d(0, 100%, 0);
    }
  }
</style>


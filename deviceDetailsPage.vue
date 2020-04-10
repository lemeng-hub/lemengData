<template>
	<view >
		<div>
			<text >网关地址:{{ gatewayAddress }}</text>
			<br><hr>
		</div>
		<div>
			<text >主站ip:</text><br>
			<span>
				<text >地址:</text><br>
				<text >端口:</text><br>
				<text >apn:</text><br>
				
			</span>
			<hr>
		</div>
		<div>
			<text >终端ip:</text><br>
			<span>
				<text >地址:</text><br>
				<text >掩码:</text><br>
				<text >网关:</text><br>
			</span>
			<hr>
		</div>
		<div>
			<text >集中器版本:</text>
			<br><hr>
		</div>
		<div>
			<text>4G模块版本:</text><br>	
		</div>
	</view>
</template>

<script>
	import api from './index'
	import detailsapi from './deviceDetailsPage'
	 export default {
		data() {
			return{
				deviceId:"00:08:81:70:50:42",
				serviceId:"6E400001-B5A3-F393-E0A9-E50E24DC4179",
				characteristicIdWriteId: "6E400002-B5A3-F393-E0A9-E50E24DC4179",//6E400004-B5A3-F393-E0A9-E50E24DC4179    6E400002-B5A3-F393-E0A9-E50E24DC4179
				characteristicIdNotifyId:"6E400003-B5A3-F393-E0A9-E50E24DC4179",//6E400005-B5A3-F393-E0A9-E50E24DC4179    6E400003-B5A3-F393-E0A9-E50E24DC4179
				meg:"681068070000FFFFFFFF01020304ED16",
				addressPasswd:"681068070000FFFFFFFF01020304ED16",
				gatewayAddress:""
			}
		
		},
		onLoad: function (option) {
			api.test();
			let self = this;
			// detailsapi.test();
			// detailsapi.printStrArrsy("0f05680e68071788b2131788b213ad16"); //测试
			// detailsapi.getData("0f05680e68071788b2131788b213ad16");
			// let tem = detailsapi.getAddress("0f05680e68071788b2131788b213ad16");
			// console.log("adrre=",tem);
	
			setTimeout(function() {
				self.onCharacteristicValueChange();
				self.sendMsg();	
			}, 100);
			
		},
		methods: {
			//监听特征值变化
			onCharacteristicValueChange:function(){
				let self = this;
				uni.onBLECharacteristicValueChange(function (res) {
									console.log("监听特征值变化"); 
									var value = detailsapi.ab2hex(res.value);
									console.log("特征值变化"+value);
									self.$data.gatewayAddress = detailsapi.getAddress(value);
				});
			},
			// 发送口令
			sendMsg:function(){
				let self = this;
				let deviceId = self.$data.deviceId
				let serviceId = self.$data.serviceId
				let characteristicIdWriteId = self.$data.characteristicIdWriteId
				let newAddressPasswd = self.packaging("05",self.$data.addressPasswd);
				setTimeout(function() {
					api.wirtebluetooth(newAddressPasswd,deviceId,serviceId,characteristicIdWriteId);
				}, 1000);
			},
			// 对发送封装
			packaging:function(pass,addressPasswd){
				let str="";
				// console.log("addressPasswd.length="+(((addressPasswd.length)>>1)+1).toString(16))
				str=(((addressPasswd.length)>>1)+1).toString(16) + pass + addressPasswd;
				return str
			},
	
		}
		 
	 }
</script>

<style>
</style>

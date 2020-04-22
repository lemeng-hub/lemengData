<template>
	<view >
		<div>
			<text >网关地址:{{ gatewayAddress }}</text> <button @tap="fillIn('请输入新的网关地址')" size="mini" style="float:right">设置</button>
			<br><hr>
		</div>
		<div>
			<text >主站ip:</text><br>
			<span>
				<text >地址:</text> <button size="mini" style="float:right">设置</button>
				<br> <br>
				<text >端口:</text> <button size="mini" style="float:right">设置</button>
				<br> <br>
				<text >apn:</text> <button size="mini" style="float:right">设置</button>
				<br>
				
			</span>
			<hr>
		</div>
		<div>
			<text >终端ip:</text><br>
			<span>
				<text >地址:</text> <button size="mini"  style="float:right">设置</button>
				<br><br>
				<text >掩码:</text> <button size="mini" style="float:right">设置</button>
				<br><br>
				<text >网关:</text> <button size="mini" style="float:right">设置</button>
				<br><br>
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
		<prompt ref="prompt" @onConfirm="onConfirm" @onCancel="onCancel" title="提示" ></prompt>    
	</view>
</template>

<script>
	import api from './index'
	import detailsapi from './deviceDetailsPage'
	import prompt from '../../components/prompt.vue';
	 export default {
		 
		 components: {
		 		prompt,
		 	},
		data() {
			return{
				deviceId:"",
				serviceId:"",
				onConnectionState:true,//是否监听连接状态(假设)
				Connectioned:false,		 // 这以验证成功为标准
				primaryUUID:"6E400001-B5A3-F393-E0A9-E50E24DC4179" ,//指定uuid 6E400001      0000FF03
				//特征值ID
				characteristicId: [{
					//支持写入操作的特征值
					writeId: "",
					//支持notify操作的特征值
					notifyId: ""
				}],
				addressPasswd:"681068070000FFFFFFFF01020304ED16", // 681268030072D204FFFFFFFF010203043316     681068070000FFFFFFFF01020304ED16
				gatewayAddress:"",
				edition:"6810680B00001788b213010203045916",
				logswitch:"680F680CFF1788b213010203045816",
				// read4G:"6810683000001788b213010203047E16"
			}
		
		},
		onLoad: function (option) {
			api.test();
			let self = this;

			setTimeout(function() {
			self.createBLEConnection();
			}, 100);
			console.log("deviceId:"+option.DeviceId)
			this.$data.deviceId = option.DeviceId
			
			
			// detailsapi.test();
			// detailsapi.printStrArrsy("0f05680e68071788b2131788b213ad16"); //测试
			// detailsapi.getData("0f05680e68071788b2131788b213ad16");
			// let tem = detailsapi.getAddress("0f05680e68071788b2131788b213ad16");
			// console.log("adrre=",tem);
			// setTimeout(function() {
			// 	self.onCharacteristicValueChange();
			// 	self.sendMsg();	
			// }, 100);
			
		},
		methods: {
	
			// 创建连接
			createBLEConnection:function(){
				//设备deviceId
				let deviceId = this.deviceId;
				let self = this;
				uni.createBLEConnection({
				  // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
				  deviceId,
				  success(res) {
					console.log("设备创建连接成功！");
				    setTimeout(function() {
				 	console.log("获取设备的services");
					// 如果没有监听连接状态，开始监听
					if(!(self.$data.onConnectionState)){
						self.onBLEConnectionStateChange();
					}
				 	self.getBLEDeviceServices();
					
				    }, 1500);
					
					self.$data.Connectioned = false; //再次初始化
					
					uni.showToast({
						icon: "none",
						title: "连接中...",
						mask: false,
						duration: 2800
					});
					
					
						// 超时提示
						setTimeout(function() {
								if(!(self.$data.Connectioned)){ 
									uni.showToast({
										icon: "none",
										title: "连接超时",
										mask: false,
										duration: 1000
									});
								}
										
							},3300);
					
				
					
				  },
				  fail(res){
					  console.log(JSON.stringify(res));
					  console.log("设备连接失败！");
					  uni.showToast({
					  	icon: "none",
					  	title: "设备连接失败！",
					  	mask: false,
					  	duration: 3000
					  });
					// 重新初始化  
					uni.closeBluetoothAdapter({
							success: res => {
							}
						});
					setTimeout(function() {
						uni.openBluetoothAdapter({
							
						    success: e => {
						        console.log('初始化蓝牙成功:' + e.errMsg);
						    },
						    fail: e => {
						        console.log('初始化蓝牙失败，错误码：' + (e.errCode || e.errMsg));
						    }
						});
						}, 100);
						
						setTimeout(function() {
				
							uni.navigateBack({
							    delta: 1,
							    animationType: 'pop-out',
							    animationDuration: 200
							});	
							},610);
					
				  }
				});
			},
			
			
			/**
			 * 获取设备的服务ID
			 */
			getBLEDeviceServices:function() {
				let deviceId = this.deviceId;
				let serviceList = [];
				let self = this;
				uni.getBLEDeviceServices({
				  // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
				  deviceId,
				  success(res) {
				    console.log(JSON.stringify(res));
					serviceList = res.services;
					for(let i = 0; i< serviceList.length; i++){
						let service = serviceList[i];
						console.log("打印获取到的每个service-uuid:"+service.uuid);
					    
						//获取指定uuid的特征值
						if (service.uuid.indexOf(self.primaryUUID) != -1) {
							self.serviceId = service.uuid;
							console.log("开始获取特征值");
							//开始获取指定服务的特征值
							self.getBLEDeviceCharacteristics(self.deviceId,service.uuid);
							break;
						}
						
					}
				  },
				  fail(res){
					  console.log('device services:', res.services);
				  }
				});
				
				},
			
			// 获取特征值方程
			getBLEDeviceCharacteristics:function(deviceId,serviceId){
				let characteristicsList = [];   // 临时存储特征列表 
				let self = this;
				// 存入当前 deviceId,serviceId
				self.$data.deviceId = deviceId;
				self.$data.serviceId = serviceId;
				uni.getBLEDeviceCharacteristics({
				  // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
				  deviceId,
				  // 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
				  serviceId,
				  success(res) {
					// 打印获取到的特征值
				    console.log(JSON.stringify(res));
					console.log(serviceId + "服务的特征值：" + JSON.stringify(res.characteristics));
					// 赋予特征列表
					characteristicsList = res.characteristics;
					//  记录  read write notify 为 true 的  characteristicId
					for (let i = 0; i < characteristicsList.length; i++) {
						let characteristic = characteristicsList[i];
						if (characteristic.uuid.indexOf("6E400002") != -1) {		//00002B01 
							self.characteristicId[0].writeId = characteristic.uuid;
							console.log("得到设备的特征值写入writeID： " + self.characteristicId[0].writeId);
						}
						if (characteristic.uuid.indexOf("6E400003") != -1) {		//00002AFF
							self.characteristicId[0].notifyId = characteristic.uuid;
							console.log("得到设备的特征值notifyID： " + self.characteristicId[0].notifyId);
						}
						
						if (self.characteristicId[0].writeId != "" && self.characteristicId[0].notifyId != "") {
							break;
						}
					}
					
					// 开启通知服务
					self.notifyBLECharacteristicValueChange();
					
				  },
				  fail(res) {
				  	console.log('device getBLEDeviceCharacteristics failed:', JSON.stringify(res));
				  }
				  
				});
				
			},
			
			// 开启通知服务
			notifyBLECharacteristicValueChange:function(){
				let deviceId = this.deviceId;
				let serviceId = this.serviceId;
				let characteristicId = this.characteristicId[0].notifyId;
				let notify = true;
				let connectioned = false;
				let self = this;
				
				self.$data.Connectioned = false;
				// 调用接口 开启通知服务
				uni.notifyBLECharacteristicValueChange({
					  state: true, // 启用 notify 功能
					  deviceId,
					  serviceId,
					  characteristicId,
					  complete(res){
						console.log('通知服务');
					  },
					  success(res) {
						  console.log('调用通知服务成功' + JSON.stringify(res));
						  // 写操作
						  setTimeout(function() {
		 // *************************************连接发送区*********************
							  api.wirtebluetooth("0405aabbcc",deviceId,serviceId,self.characteristicId[0].writeId);
						  }, 1300);
						 
						  // ArrayBuffer转16进度字符串示例
						  function ab2hex(buffer) {
							const hexArr = Array.prototype.map.call(
							  new Uint8Array(buffer),
							  function (bit) {
								return ('00' + bit.toString(16)).slice(-2)
							  }
							)
							return hexArr.join('')
						  };
						  
						  // 立即监听低功耗蓝牙设备的特征值变化事件
						  uni.onBLECharacteristicValueChange(function (res) {
							var value = ab2hex(res.value);
							console.log(value);
							if(value === "0405aabbcc"){
								console.log("连接成功,0405aabbcc验证已核对");
								self.$data.Connectioned = true;
								connectioned = true;
	// *************************************发送区*********************
								
								// self.sendMsg(self.$data.addressPasswd);	        // 验证连接成功后立即发送内容
								// self.sendMsg(self.$data.edition); 				// 读取集中器版本信息
								// self.sendMsg(self.$data.logswitch);			//日志打印开关
								// self.sendMsg(self.$data.read4G);
								uni.showToast({
									icon: "none",
									title: "连接成功",
									mask: false,
									duration: 1000
								});
								
							}
							if(connectioned){
								// 0表示完整帧，1表示起始帧，2表示后续帧，3表示结束帧
								let dataJSON = detailsapi.getCompleteData(value);
								if(dataJSON.flag ==="-1"){
									console.log("dataJSON.flag ==='-1'")
								}else{
									
									if(dataJSON.flag ==="0"){
										console.log("***********完整帧vv")
										console.log("完整帧data=",JSON.stringify(dataJSON.data));
									
										if(dataJSON.data.length===2&& dataJSON.data[1]=="00"){
											self.sendMsg(self.$data.addressPasswd);	//修改成功立即查询
											uni.showToast({
												icon: "none",
												title: "修改成功",
												mask: false,
												duration: 1000
											});
										}else{
											if(dataJSON.data.length===4){
												self.$data.gatewayAddress = detailsapi.getAddress(dataJSON.data);
											}

										}
									}
									if(dataJSON.flag ==="1"){
										console.log("***********起始帧vv")
									}
									if(dataJSON.flag ==="2"){
										console.log("***********后续帧vv")
									}
									if(dataJSON.flag ==="3"){
										console.log("***********结束帧vv")
									}

								}

							}
							
						  });
			
				  },
				  fail(res){
					  console.log('开启通知服务失败'+JSON.stringify(res));
				  }
				});
				
			},
			
			
			
			
			
			// 发送口令
			sendMsg:function(sendData){
				let self = this;
				let deviceId = self.$data.deviceId
				let serviceId = self.$data.serviceId
				let characteristicIdWriteId = self.characteristicId[0].writeId
				// 对指令码封装发送格式 
				let newAddressPasswd = detailsapi.packaging("05",sendData);
				setTimeout(function() {
					api.wirtebluetooth(newAddressPasswd,deviceId,serviceId,characteristicIdWriteId);
				}, 1000);
			},
	
	
			onBackPress(e) {  
			console.log("点击返回啦")
			let self = this
			uni.closeBLEConnection({
			  deviceId:self.$data.deviceId,
			  success(res) {
			   console.log('断开蓝牙模块成功');
			  }
			});
			}, 
			
			
			fillIn:function(str){
					this.$refs.prompt.show(str)
			},
			// 模态框
			onConfirm:function(e){
				let self = this
				console.log(e);
				let _cost = e;
				if (_cost == '') {
				 console.log('你还未输入');
				 uni.showModal({
					title: '提示',
					content: '你还未输入',
					showCancel: false,
					confirmText: "确定"
				 })
				 return;
				}
				else{
				  this.$refs.prompt.hide();
				 let addr =  detailsapi.getChangeAddress(_cost)
				 self.sendMsg(addr);
				 //  uni.showModal({
					// title: '提示',
					// content: '你输入的是:'+_cost,
					// showCancel: false,
					// confirmText: "确定"
				 //  })
				}
			},
			onCancel:function(){
				this.$refs.prompt.hide();
				this.$refs.prompt.cost = '';
			}
	
		}
		 
	 }
</script>

<style>
</style>

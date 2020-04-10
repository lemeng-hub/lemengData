<template>
	<view class="content">
		 <button v-if="Startbutton" Startbutton type="primary" @tap="startBluetooth">扫描</button>
		 <button v-if="Stopbutton" type="primary" @tap="stopBluetoothDevicesDiscovery">停止扫描</button>
		 <button  type="primary" @tap="notifyBLECharacteristicValueChange">开启订阅特征值</button>
	<!-- 	 <button  type="primary" @tap="getBluetoothAdapterState">获取本机蓝牙适配器状态</button>
		 <button  type="primary" @tap="onBluetoothAdapterStateChange">开启监听蓝牙适配器状态</button> -->
		 <button  type="primary" @tap="closeBluetoothAdaptertwo">关闭蓝牙</button>
		 <button  type="primary" @tap="goDeviceDetailsPage">跳转测试</button>
	    <view v-for="device in devicesList" :key="device.deviceId" v-if="device.name !=''">
			<div :class="clickclass"  @click="onclick(device.name)" v-if="isgetDevices">
				<text v-if="isStartBluetooth">设备名称:{{ device.name }}</text><br>
				<text v-if="isStartBluetooth">设备的id:{{ device.deviceId }}</text><br>
				<text v-if="isStartBluetooth">LocalName:{{ device.localName }}</text>
				<hr>
			</div>
		
	    </view>
		<br>
 
	</view>
</template>

<script>
	import api from './index'
	
	  export default {
		  
		  data() {
		      return {
		          //是否已经打开蓝牙，默认为false，当蓝牙适配器初始化成功后为true
		          isOpenBle: false, //初始化
				  Startbutton:true, //开始扫描
				  Stopbutton:false, // 停止扫描
				  isStartBluetooth:false, //是否已经开始搜索
				  isgetDevices:false,  //是否在获取周边设备
				  isconnection:false,	//连接状态
				  onConnectionState:false,//是否监听连接状态
				  clickclass:"defalutclickcss",//点击样式,默认样式
		          devicesList: [{ }],
				  deviceId:"",
				  serviceId:"",
				  primaryUUID:"6E400001" ,//指定uuid 6E400001      0000FF03
				  
				  //特征值ID
				  characteristicId: [{
				  	//支持写入操作的特征值
				  	writeId: "",
				  	//支持notify操作的特征值
				  	notifyId: ""
				  }],
			 
				  // 测试
				  testmsg: "BD0000000000000001240001B1158146389720015814638972133614980530013361498053123456789001234567894516", // 发送的信息
				  
		      }
		  },
		   
		  onLoad() {
		      //在页面加载时候初始化蓝牙适配器
				this.openBluetoothAdapter()
			  //同时监听蓝牙连接状态
			  this.onBLEConnectionStateChange();
		  },
		   methods: {
			   
			   // 跳转测试
			   goDeviceDetailsPage:function(){
				let self = this;
				let Data = {
					Isconnection:self.$data.isconnection,
					DeviceId:self.$data.deviceId,
					ServiceId:self.$data.serviceId,
					WriteId:self.$data.characteristicId[0].writeId
				};
			    let newdata = JSON.stringify(Data)
				 uni.navigateTo({
				     url: "deviceDetailsPage", 
				 });  
			   },
			   openBluetoothAdapter:function(){
				   let self = this;
				   uni.openBluetoothAdapter({
				       success: e => {
				           console.log('初始化蓝牙成功:' + e.errMsg);
				           self.$data.isOpenBle = true;
				           console.log(self.$data.isOpenBle);
				       },
				       fail: e => {
				           console.log('初始化蓝牙失败，错误码：' + (e.errCode || e.errMsg));
				       }
				   });
			   },
			   
			   startBluetooth:function(){
				   
				    let self = this;
				    this.$data.isStartBluetooth = true;
					this.$data.Stopbutton = true;
					this.$data.Startbutton = false;
					console.log("开始搜寻附近的蓝牙外围设备");
				   
				   setTimeout(function() {
					  uni.startBluetoothDevicesDiscovery({
					  	allowDuplicatesKey: false,
					    success(res) {
					     // console.log(res);
					  	 self.getBluetoothDevicesFound();
					    }
					  }); 
					   
				   },300);
				   
			
			   },
			   
			   getBluetoothDevicesFound:function(){
				    let self = this;
			       console.log("获取蓝牙设备");
					uni.onBluetoothDeviceFound(function (devices) {
					  // console.log(devices);
					 self.getBluetoothDevices();
					});
			   },
			   
			   getBluetoothDevices:function(){
				   let self = this;
				   uni.getBluetoothDevices({
				     success(res) {
						 self.$data.isgetDevices = true;
						// console.log(res.devices);
						self.devicesList=res.devices;
						
				     }
				   });
			   },
			   stopBluetoothDevicesDiscovery:function(){
				   let self = this;
				   if(self.$data.Stopbutton){
					  uni.stopBluetoothDevicesDiscovery({
					    success(res) {
					      console.log("扫描停止");
						  self.$data.Startbutton = true;
						  self.$data.Stopbutton = false;
					    }
					  }); 
				   }
				 
			   },
			   // 给与点击事件
				onclick:function(name){
					let self = this;
					console.log("点击事件"+name);
					uni.showToast({
					    title: '连接'+name,
					    content: name 
					});
					self.$data.clickclass = "changeclickcss";
					// 恢复样式
					setTimeout(function() {self.$data.clickclass ="defalutclickcss"; }, 200);
					for (let i = 0; i < self.devicesList.length; i++) {
						let eq = self.devicesList[i];
						if (eq.name === name) { 
							self.$data.deviceId = eq.deviceId;	
							console.log("查找到了设备deviceId：" + self.$data.deviceId);
							//在这准备连接设备
							self.createBLEConnection();
							// 点击连接后 停止扫描
							self.stopBluetoothDevicesDiscovery();
							break;
						}			
					}
					
				},
				// 创建连接
				createBLEConnection:function(){
					//设备deviceId
					let deviceId = this.deviceId;
					let self = this;
					uni.createBLEConnection({
					  // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
					  deviceId,
					  success(res) {
						console.log("设备连接成功！");
					    setTimeout(function() {
					 	console.log("获取设备的services");
						// 如果没有监听连接状态，开始监听
						if(!(self.$data.onConnectionState)){
							self.onBLEConnectionStateChange();
						}
					 	self.getBLEDeviceServices();
						
					    }, 1500);
					  },
					  fail(res){
						  console.log(JSON.stringify(res));
						  console.log("设备连接失败！");
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
							console.log("打印获取到的每个uuid:"+service.uuid);
						    
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
									console.log("设备的特征值写入writeID： " + self.characteristicId[0].writeId);
								}
								if (characteristic.uuid.indexOf("6E400003") != -1) {		//00002AFF
									self.characteristicId[0].notifyId = characteristic.uuid;
									console.log("设备的特征值notifyID： " + self.characteristicId[0].notifyId);
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
						let self = this;
						
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
									  // api.sendMessages("0405aabbcc",deviceId,serviceId,self.characteristicId[0].writeId);
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
									// console.log(`characteristic ${res.characteristicId} has changed, now is ${res.value}`); 
									var value = ab2hex(res.value);
									// console.log(value);
									if(value === "0405aabbcc"){
										console.log("连接成功，页面跳转");
										self.goDeviceDetailsPage();
									}
								  });

						  },
						  fail(res){
							  console.log('开启通知服务失败'+JSON.stringify(res));
						  }
						});
						
					},
					
					/**
					 * 监听低功耗蓝牙连接状态的改变事件。包括开发者主动连接或断开连接，设备丢失，连接异常断开等等
					 */
					onBLEConnectionStateChange() {
						let self = this;
						self.$data.onConnectionState = true;
						let count = 0;
						uni.onBLEConnectionStateChange(res => {
							// 该方法回调中可以用于处理连接意外断开等异常情况
							console.log(`蓝牙连接状态 -------------------------->`);
							console.log(JSON.stringify(res));
							self.$data.isconnection = res.connected
							if (!res.connected) {
								// if (this.isStop) return;
								console.log('低功耗蓝牙断开:');
								uni.showToast({
									icon: "none",
									title: "蓝牙已经断开！",
									mask: false,
									duration: 3000
								});
					
								//在这里尝试重连
								//this.createBLEConnection();
								//关闭连接
								this.closeBluetoothAdapter();
							}
						});
					},
					/**
					 * 断开蓝牙连接
					 */
					closeBluetoothAdapter() {
						uni.closeBluetoothAdapter({
							success: res => {
								console.log('断开蓝牙模块成功');
					
								uni.showToast({
									icon: "none",
									title: "蓝牙已经断开！",
									mask: false,
									duration: 3000
								});
							}
						});
					},
					
					// 监听蓝牙适配器状态变化事件
					onBluetoothAdapterStateChange:function(){
					uni.onBluetoothAdapterStateChange(function (res) {
						console.log("监听蓝牙适配器状态变化事件")
						console.log('adapterState changed, now is', res)
						uni.showToast({
							icon: "none",
							title: "监听蓝牙适配器状态",
							mask: false,
							duration: 3000
					  });
					});	
					},
					// 获取本机蓝牙适配器状态。
					getBluetoothAdapterState:function(){
						uni.getBluetoothAdapterState({
						  success(res) {
							console.log("获取本机蓝牙适配器状态")
						    console.log(res)
						  }
						});
					},
					
					// 关闭蓝牙模块
					closeBluetoothAdaptertwo:function(){
						let self = this;
						if(self.$data.isOpenBle){
							uni.closeBluetoothAdapter({
							  success(res) {
								self.$data.isOpenBle = false;
								console.log("关闭蓝牙模块")
							    console.log(res)
								// app 提示信息
								uni.showToast({
									title: "适配器关闭,1秒后重新初始化",
									duration: 1500
								});
								
								setTimeout(function() {
								self.openBluetoothAdapter();
								}, 1000);
							  }
							});
						}
					
					}
						
		   }
	  }	
</script>

<style>
	
	.defalutclickcss {
		background: linear-gradient(to right,#d3959b,#bfe6ba);
	},
	.changeclickcss {
		background: linear-gradient(to right,#bfe6ba,#d3959b);
	}
</style>

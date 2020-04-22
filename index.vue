<template>
	
	<view class="content">
		<text style="margin: 0 auto;">附近设备：</text>
		<view show-scrollbar="true" style="height: 380px; overflow: scroll"> <!-- v-if="device.name !=''"    -->
			<view hover-class="changeclickcss" hover-start-time="400" hover-stay-time="200" v-for="device in devicesList" :key="device.deviceId"  v-if="device.name !=''" > 
				 <view :class="clickclass" v-if="String(device.name).includes('MX_BLE_COMN')"> <!--     -->
						<view  @click="onclick(device.name)" v-if="isgetDevices" >
							<text v-if="isStartBluetooth">设备名称:{{ device.name }}</text><br>
							<text v-if="isStartBluetooth">设备的id:{{ device.deviceId }}</text><br>
							<text v-if="isStartBluetooth">LocalName:{{ device.localName }}</text>
							<hr>
						</view>
				</view>
			</view>
		</view>
		<br>
		<view style="width: 180px;margin: 0 auto;">
			<button v-if="Startbutton" Startbutton type="primary" @tap="startBluetooth">扫描</button>
				 <button v-if="Stopbutton" type="primary" @tap="stopBluetoothDevicesDiscovery">停止扫描</button><br>
				 <!-- <button  type="primary" @tap="notifyBLECharacteristicValueChange">开启订阅特征值</button> -->
			<!-- 	 <button  type="primary" @tap="getBluetoothAdapterState">获取本机蓝牙适配器状态</button>
				 <button  type="primary" @tap="onBluetoothAdapterStateChange">开启监听蓝牙适配器状态</button> -->
				 <!-- <button  type="primary" @tap="closeBluetoothAdaptertwo">关闭蓝牙</button><br> -->
				 <button  type="primary" @tap="fillIn">手动填写</button><br>
				 <!-- <button  type="primary" @tap="goDeviceDetailsPage">跳转测试</button> -->
				  <button  type="primary" @tap="scanCode">扫码测试</button>
				  <!-- <button  type="primary" @tap="goTestPage">专门用于测试</button> -->
		</view>
	 <prompt ref="prompt" @onConfirm="onConfirm" @onCancel="onCancel" title="提示" ></prompt>    	<!--  :text="promptText"-->
	</view>
	
		
</template>
<!-- <template>

</template> -->
<script>
	import api from './index'
	import prompt from '../../components/prompt.vue';
	  export default {
		  // 模态框
		  	components: {
		  			prompt,
		  		},
				
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
		      }
		  },
		   
		  onLoad() {
			  let self = this;
		      //在页面加载时候初始化蓝牙适配器
				this.openBluetoothAdapter()
			  //同时监听蓝牙连接状态
			  this.onBLEConnectionStateChange();
			 
			 // 立即扫描
			  setTimeout(function () {
			         self.startBluetooth();
			      }, 1000);
			      setTimeout(function () {
			              console.log('start pulldown');
			          }, 1000);
			          // uni.startPullDownRefresh();
			    
		  },
		  onPullDownRefresh() {
			  api.test();
			  this.startBluetooth();
		      console.log('refresh');
		      setTimeout(function () {
		          // uni.stopPullDownRefresh();
		      }, 800);
		  },
		   
		   methods: {
			   
			   //手动填写
			   fillIn:function(){
				   this.$refs.prompt.show("请输入")
				  // uni.showModal({
				  //     title: '提示',
				  //     content: '这是一个模态弹窗',
				  //     success: function (res) {
				  //         if (res.confirm) {
				  //             console.log('用户点击确定');
				  //         } else if (res.cancel) {
				  //             console.log('用户点击取消');
				  //         }
				  //     }
				  // }); 
			   },
		
			   
			   scanCode:function(){
				 // 允许从相机和相册扫码
				 uni.scanCode({
				     success: function (res) {
				         console.log('条码类型：' + res.scanType);
				         console.log('条码内容：' + res.result);
				     }
				 });  
			   },
		
		
				// 专门用于测试，生产要删除
				goTestPage:function(){
					uni.navigateTo({
					    url: "test", 
					});  
				},
		
		
			   
			   // 跳转测试
			   goDeviceDetailsPage:function(){
				let self = this;
				 uni.navigateTo({
				     url: "deviceDetailsPage?DeviceId="+self.$data.deviceId, 
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
					// self.$data.clickclass = "changeclickcss";
					// 恢复样式
					setTimeout(function() {self.$data.clickclass ="defalutclickcss"; }, 200);
					for (let i = 0; i < self.devicesList.length; i++) {
						let eq = self.devicesList[i];
						if (eq.name === name) { 
							self.$data.deviceId = eq.deviceId;	
							console.log("查找到了设备deviceId：" + self.$data.deviceId);
							//点击立即跳转
							self.goDeviceDetailsPage();
							// 点击连接后 停止扫描
							self.stopBluetoothDevicesDiscovery();
							break;
						}			
					}
					
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
									duration: 2000
								});
					
								//在这里尝试重连
								//this.createBLEConnection();
								//关闭连接
								// this.closeBluetoothAdapter();
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
					
					},
					
					
					// 模态框
					
					onConfirm:function(e){
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
						  uni.showModal({
							title: '提示',
							content: '你输入的是:'+_cost,
							showCancel: false,
							confirmText: "确定"
						  })
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
	
	.defalutclickcss {
		background: linear-gradient(to right,#d3959b,#bfe6ba);
	},
	.changeclickcss {
		background: linear-gradient(to right,#bfe6ba,#d3959b);
	}
</style>

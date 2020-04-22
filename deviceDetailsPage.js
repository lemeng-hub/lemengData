const detailsapi = {
	test:function(){
		console.log("测试detailsapi");
	},
	
	//------------------------------- 分割线 接收区------------------------------
	// ArrayBuffer转16进度字符串示例
	 ab2hex:function(buffer) {
		const hexArr = Array.prototype.map.call(
		  new Uint8Array(buffer),
		  function (bit) {
			return ('00' + bit.toString(16)).slice(-2)
		  }
		)
		return hexArr.join('')
	},
	//字符解析成字符数组，每个元素代表一个字节
	strToStrArray:function(str){
		var strArray = [];
		for(let i=0; i < str.length;i += 2){
			strArray[i/2] = str.substr(i, 2);
		}
		return strArray
	},
	
	// 16进制转10进制 ASCII码转字符 @param Array @return String
	asciiToChar:function(arr){
		let str ="";
		for(let i = 0;i<arr.length;i++){
			str += String.fromCodePoint(parseInt(arr[i],16))	
		}
		console.log("ASCII码转字符:"+str)
		return str
	},
	
	// 打印字符数组 测试
	printStrArrsy:function(str){               //测试函数
		var arr = this.strToStrArray(str);
		for(let i = 0;i<arr.length;i++){
			console.log("打印字符数组"+arr[i]);
		}
	},
	//校验 @param String  @return  boolean
	check:function(str){
		// 校验
		var arr = this.strToStrArray(str);
		if(arr[2] === "68" && arr[arr.length-1] ==="16"){
			let code = 0
			for(let i = 2;i<(arr.length-2);i++){
				code += parseInt(arr[i], 16)
			}
			// console.log("code="+code);
			var temp =  code.toString(16).slice(-2)
			// console.log("temp="+temp);
			//验证校验和
			if(parseInt(temp, 16) == parseInt(arr[arr.length-2], 16)){
				console.log("验证校验和成功");
				return true
			}
		}
		return false
	},
	// 获取每一帧数据内容 @param String  @return  Array
	getData:function(str){
		var strArray = [];
		let arr = this.strToStrArray(str);
		let len ="";
		let index = 0;
	    let flag = false;
		flag = this.check(str);
		if(flag){
			len = arr[3];
			//校验长度
			if(parseInt(len, 16) == (arr.length-2)){	//校验长度
			
				for(let i = 6;i<(arr.length-6);i++){
					strArray[i-6] = arr[i];
				}
			}else{
				console.log("getData中长度校验失败");
			}
		}else{
			console.log("出错啦，校验和失败");
		}
		
		return strArray
	},
	
	// 判断控制节 返回完整 内容
	//高两位为帧标识：0表示完整帧，1表示起始帧，2表示后续帧，3表示结束帧。低六位为数据标识：数据传输为5
	// 全局定义
	 CompleteData:[],// 用于缓存接收
	//@param String  return JSON
	getCompleteData:function(str){
		let self = this
		let commFlag = str.substr(2, 2);
		let dataJSON = {
			flag:"-1",
			data:[]
		};
		if(commFlag != " "){
			//完整帧
			if(commFlag === "05"){
				let data = self.getData(str)
				self.CompleteData.push(...data)
				let tempData = (self.CompleteData).concat()
				self.CompleteData=[]
				dataJSON = {
					flag:"0",
					data:tempData
				};
				return dataJSON
			}
			// 起始帧
			if(commFlag === "45"){
				if(self.CompleteData.length != 0){
					self.CompleteData=[]
				}
				let data = self.getData(str)
				self.CompleteData.push(...data)
				dataJSON = {
					flag:"1",
					data:[]
				};
				return dataJSON
			}
			// 后续帧
			if(commFlag === "85"){
				let data = self.getData(str)
				self.CompleteData.push(...data)
				dataJSON = {
					flag:"2",
					data:[]
				};
				return dataJSON
			}
			// 结束帧
			if(parseInt(commFlag, 16) === parseInt("C5", 16)){
				let data = self.getData(str)
				self.CompleteData.push(...data)
				let tempData = (self.CompleteData).concat()
				self.CompleteData=[]
				dataJSON = {
					flag:"3",
					data:tempData
				};
				return dataJSON
			}
				
		}
		return dataJSON
		
	},
	
	
	
	//解析维护平台集中器地址 @param Array  return String
	getAddress:function(arr){
		var returnStr = "";
		var data = arr
		console.log("开始分割线^^^^^^解析集中器地址^获取应答内容^^^^^^^^^^^^^^^");
		console.log("data=",JSON.stringify(data));
		console.log("获取内容的长度="+data.length+"字节");
		console.log("结束分割线vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv");
		if(data.length>0){
			let towtemp =  data[data.length-1]+data[data.length-2]; // 获取后两位
			// console.log("towtemp="+towtemp);
			let lowtemp = ( parseInt(towtemp, 16) ).toString(10)    // 获取低5(4)位
			let hightemp = data[1]+data[0];
			returnStr = hightemp+lowtemp;
			if(returnStr.length<9){
				returnStr =  hightemp+"0"+lowtemp;
			}
		}
		return returnStr
	},
	
	//------------------------------- 分割线 发送区------------------------------
	// 对发送封装 @param pass: 05,d5; addressPasswd:指令码，该码包括内容校验和
	packaging:function(pass,addressPasswd){
		let str="";
		// console.log("addressPasswd.length="+(((addressPasswd.length)>>1)+1).toString(16))
		str=(((addressPasswd.length)>>1)+1).toString(16) + pass + addressPasswd;
		return str
	},
	
	// -----------------------维护平台集中器地址修改-----------------------
	//对地址输入内容处理可发送格式 @param String @ return String
	doInputAddressToSend:function(str){
		let addr =""
		let highcode = str.substr(2, 2)+str.substr(0, 2);
		// console.log(highcode);
		let lowcode = str.substr(4);
		let low_code = (parseInt(lowcode,10)).toString(16)
		if((low_code.length)%2 == 1){
			lowcode = low_code.substr(-2)+"0"+low_code.substr(0,(low_code.length-2))
		}else{
			lowcode = low_code.substr(-2)+low_code.substr(0,(low_code.length-2))	
		}
		// console.log(lowcode);
		addr = highcode+lowcode
		console.log(addr)
		return addr
	},
	
	//获取校验和 @param String return String
	getCheck:function(str){
		let self = this;
		let arr = self.strToStrArray(str);
		let com = 0
		for(let i=0 ; i<arr.length;i++){
			com += parseInt(arr[i],16)
		}
		let check = (com.toString(16)).substr(-2)
		console.log(check)
		return check
	},
	
	//获取地址口令  @param String return String
	getChangeAddress:function(str){
		let self = this
		let s = "68126803" + self.doInputAddressToSend(str)+ "FFFFFFFF01020304"
		let Check = self.getCheck(s)
		let addr = s+Check+"16"
		console.log(addr)
		return addr
	},
	
	//------------------------------- 分割线 暂时不需------------------------------
	// 开启通知服务
	notifyBLECharacteristicValueChange:function(){
		let deviceId = this.deviceId;
		let serviceId = this.serviceId;
		let characteristicId = this.characteristicIdNotifyId;
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
					  api.wirtebluetooth("1105681068070000FFFFFFFF01020304ED16",deviceId,serviceId,self.characteristicIdWriteId);
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
					console.log(`characteristic ${res.characteristicId} has changed, now is ${res.value}`); 
					var value = ab2hex(res.value);
					console.log(value);
				  });
	
		  },
		  fail(res){
			  console.log('开启通知服务失败'+JSON.stringify(res));
		  }
		});
		
	},
};
export default detailsapi;
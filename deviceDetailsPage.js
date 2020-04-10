const detailsapi = {
	test:function(){
		console.log("测试detailsapi");
	},
	
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
	// 打印字符数组 测试
	printStrArrsy:function(str){
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
	// 获取数据内容 @param String  @return  Array
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
			if(parseInt(len, 16) == (arr.length-2)){
				for(let i = 6;i<(arr.length-6);i++){
					strArray[i-6] = arr[i];
				}
			}
		}
		
		return strArray
	},
	//解析维护平台集中器地址 @param String  return String
	getAddress:function(str){
		var returnStr = "";
		var data = this.getData(str);//获取内容
		console.log("data=",JSON.stringify(data));
		console.log("获取内容=",data.length);
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
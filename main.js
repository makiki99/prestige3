let layer = 0;

let data = {
	coins: 0,
	prestiges: (()=>{
		let a=[];
		for (let x = 0; x < 10; x++) {
			a[x] = [];
			for (let y = 0; y < 10; y++) {
				a[x][y] = [];
				for (let z = 0; z < 10; z++) {
					a[x][y][z] = 0;
				}
			}
		}
		return a;
	})()
};

let names = [
	"nano",
	"micro",
	"mini",
	"small",
	"partial",
	"full",
	"multi",
	"hyper",
	"ultra",
	"final"
];

let descriptions;

function getGain() {
	let gain = 1;
	for (let x = 0; x < 10; x++) {
		for (let y = 0; y < 10; y++) {
			for (let z = 0; z < 10; z++) {
				gain *= data.prestiges[x][y][z]+1;
			}
		}
	}
	return gain;
}

function getRequirement(x,y,z) {
	if (x===0 && y===0 && z===0) {
		return Math.floor(Math.pow(1.5,data.prestiges[0][0][0])*10);
	} else {
		return Math.pow((x+y+z+1),(data.prestiges[x][y][z]+1));
	}
}

function canActivatePrestige(x,y,z) {
	if (x===0 && y===0 && z===0) {
		return (data.coins >= getRequirement(x,y,z));
	}
	if (
		(x!==0 && data.prestiges[x-1][y][z] >= getRequirement(x,y,z)) ||
		(y!==0 && data.prestiges[x][y-1][z] >= getRequirement(x,y,z)) ||
		(z!==0 && data.prestiges[x][y][z-1] >= getRequirement(x,y,z))
		) {
		return false;
	}
	return true;
}

function activatePrestige(x,y,z) {
	console.log(x,y,z);
	if (canActivatePrestige(x,y,z)) {
		data.coins = 0;
		for (let i = 0; i <= x; i++) {
			for (let j = 0; j <= y; j++) {
				for (let k = 0; k <= y; k++) {
					if (!(i === x && j === y && k === z)) {
						data.prestiges[i][j][k] = 0;
					}
				}
			}
		}
		data.prestiges[x][y]++;
		updateDescriptionsAndNames();
	}
	draw();
}

function update() {
	data.coins += getGain();
	localStorage.OH_NO= JSON.stringify(data);
}

function draw() {
	document.getElementById("coins").innerHTML = data.coins;
	document.getElementById("gain").innerHTML = getGain();
	for (let i = 0; i < 10; i++) {
		for (let j = 0; j < 10; j++) {
			let btn = document.getElementById("tier"+i+j);
			btn.innerHTML = "Tier\n("+i+","+j+","+layer+")\nx"+data.prestiges[i][j][layer];
		}
	}
}

function updateDescriptionsAndNames() {
	let z =0; //temp
	descriptions = (()=>{
		let a=[];
		for (var x = 0; x < 10; x++) {
			a[x] = [];
			for (var y = 0; y < 10; y++) {
				a[x][y] = "Tier("+x+","+y+","+z+"): "+names[x]+names[y]+names[z]+"prestige\r\nPrestige requirements:";
				if (x===0 && y===0 && z===0) {
					a[x][y] += "\r\n" + getRequirement(x,y,z) + " coins";
				}
				if (x!==0) {
					a[x][y] += "\r\n" + getRequirement(x,y,z) +" of tier("+x+","+y+","+z+")";
				}
				if (y!==0) {
					a[x][y] += "\r\n" + getRequirement(x,y,z) +" of tier("+x+","+y+","+z+")";
				}
				if (z!==0) {
					a[x][y] += "\r\n" + getRequirement(x,y,z) +" of tier("+x+","+y+","+z+")";
				}
			}
		}
		return a;
	})()
}

window.addEventListener("load",function () {
	if (localStorage.QUADRATIC_SHITPOST) {
		data = JSON.parse(localStorage.QUADRATIC_SHITPOST)
	}
	let table = document.getElementById("buyables");
	updateDescriptionsAndNames();
	for (let i = 0; i < 10; i++) {
		let tr = document.createElement("tr");
		for (let j = 0; j < 10; j++) {
			let td = document.createElement("td");
			let btn = document.createElement("button");
			btn.id = "tier"+i+j;
			btn.addEventListener("click", ((x,y)=>{return (()=>{
				activatePrestige(x,y,layer);
				document.getElementById("tooltip").innerText = descriptions[x][y];
			})})(i,j));
			btn.addEventListener("mouseover", (e)=>{
				let tooltip = document.getElementById("tooltip");
				tooltip.style.display = "block";
				tooltip.style.top = (e.currentTarget.getBoundingClientRect().top+50)+"px";
				tooltip.style.left = (e.currentTarget.getBoundingClientRect().left+20)+"px";
				tooltip.style.bottom = "";
				tooltip.style.right = "";
				tooltip.innerText = descriptions[parseInt(e.currentTarget.id[4])][parseInt(e.currentTarget.id[5])];
				if (tooltip.getBoundingClientRect().bottom > window.innerHeight) {
					tooltip.style.top = "";
					tooltip.style.bottom = (window.innerHeight-(e.currentTarget.getBoundingClientRect().bottom-50))+"px";
				}
				if (tooltip.getBoundingClientRect().right > window.innerWidth) {
					tooltip.style.left = "";
					tooltip.style.right = (window.innerWidth-(e.currentTarget.getBoundingClientRect().right-50))+"px";
				}
			});
			btn.addEventListener("mouseout", (e)=>{document.getElementById("tooltip").style.display = "none"});
			td.appendChild(btn);
			tr.appendChild(td);
		}
		table.appendChild(tr);
	}
	draw();
	setInterval(function () {
		update();
		draw();
	}, 1000);
	console.log("interval loaded")
})

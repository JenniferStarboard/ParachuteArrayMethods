//Global variables
var priLabels = []; //This might be needed for number chrunching later

// Functions to Control Interactive Color Changes
function SwitchColor(pnt){
	var value = pnt.value;
	
	if (value == "Undecided"){
		pnt.style.backgroundColor = "#FFFFFF";
		pnt.style.color = "#000000";
	} else {
		pnt.style.backgroundColor = "#000000";
		pnt.style.color = "#FFFFFF";
	}
	
}

//Function to create DOM elements
	//Create list element for results
function Printer(output, pnt){
	let stuff1 = document.createElement('li');
	let stuff2 = document.createTextNode(output);
	
	stuff1.appendChild(stuff2);
	pnt.appendChild(stuff1);
}
	//Create Selection Boxes
function CreateCompair (k, halt, firstP, allP) {
	var numOp = [];
	
	for(let i=k+1; i<halt; i++){
		let box = document.createElement('select');
		let opDefault = document.createElement('option');
		let opFirst = document.createElement('option');
		let opVar = document.createElement('option');
		
		box.setAttribute('onchange', 'SwitchColor(this)');
		
		//Create the Option's Text
		opDefault.text = 'Undecided';
		opDefault.setAttribute('value', 'Undecided');
		box.add(opDefault);
		
		opFirst.text = firstP;
		opFirst.setAttribute('value', firstP);
		box.add(opFirst);
		
		opVar.text = allP[i];
		opVar.setAttribute('value', allP[i]);
		box.add(opVar);
		
		//create the array.
		numOp.push(box);
	}
	
	return numOp;
}

function CreateSelectBoxes(dis, pri){
	var cnt1 = pri.length;
	
	//remove stuff already in the HTML display element
	dis.innerHTML = " ";
	
	for (let i=0; i<cnt1; i++){
		//Creating HTML Elements
		let thing1 = document.createTextNode(pri[i]);
		let thing2 = document.createElement('h3');
		let thing3 = document.createElement('p');
			//Creating an Array of Selection Boxes
		let boxOp = CreateCompair(i, cnt1, pri[i], pri);
		
		//Arranging HTML Elements for Insertion
			//Entering Text into a H3 then the H3 into a Div display
		thing2.appendChild(thing1);
		dis.appendChild(thing2);
		
		//Enter selection boxes into a paragraph
		let cnt2 = boxOp.length;
		for(let i=0; i<cnt2; i++){	
		thing3.appendChild(boxOp[i]);
		}
			//Then the paragraph into the Div display
		dis.appendChild(thing3);	
	}
}

// Function to Collect Input About Priorites
function CollectLabels(){
	const pntD = document.getElementById('selection'); //Points to display DIV in HTML
	var priorities = [];
		//Tools to Get the Text Given by User
	var labels = document.getElementsByTagName('input');
	var cnt = labels.length;
	
	for(let i=0; i<cnt; i++) {
		if((labels[i].getAttribute('type')=='text')&&(labels[i].value != "")){ //Should I be using ===?
			priorities.push(labels[i].value);
		}
	}
	
	document.getElementById('result').innerHTML = " "; //Clear any exsisting results list.
	
	CreateSelectBoxes(pntD, priorities); //Set-up for collecting further data from user
	priLabels = priorities; //Add to global variable, for numbercrunching later
}


//Number Crunching Functions
function TiedTwo(defend, chall, pnt){
	let hold = defend.wins.findIndex(function(el, idx, arr){return el.match===chall.label});
	let winner = (defend.wins[hold].vic) ? defend.label : chall.label;
	let loser = (!defend.wins[hold].vic) ? defend.label : chall.label;
	
	Printer(winner, pnt);
	Printer(loser, pnt);
}

function DeepClone(cloneMe){
	
	function Deepening(el2, ind2, arr2){
		
		let stop = this.length;
		let hold = false;
		
		for(let i=0; i<stop; i++){
			if(el2.match===this[i].label){
				hold = true;
			}
		}
		
		return hold;
	}
	
	function Deeper(el, ind, arr){
		
		let shortWins = el.wins.filter(Deepening, arr);
		let obj = {
			label: el.label,
			score: 0,
			tied: false,
			tiedType: -1,
			wins: []
		};
		
		shortWins.map(function(ell){
			let a = {
				match: ell.match,
				vic: ell.vic
			};
			return a;
		});
		obj.wins = shortWins;
		
		return obj;
	}
	
	let grown = cloneMe.map(Deeper);
	
	//Count New Score
	grown.forEach(function(a, ind_a, arr_a){
		a.wins.forEach( function(b, ind_b, arr_b){
			if(b.vic===true){
				this.score++;
			};
		}, a);
	});
	
	//I don't use these values now, but I don't want to get ride of the code.
	//Check for Ties
	/*grown.forEach(function(el, ind, arr){
		let hold = arr.find(function(a, ind_a, arr_a){
					return (a.score===el.score)&&(ind!==ind_a);
				});
		
		el.tied = (hold!==undefined)? true : false;
	});
	
	//Determine TiedType
	 grown.forEach(function(el, ind, arr){
		let holder = arr.filter(function(a, indA, arrA){
			return (a.score===el.score);
		});
		el.tiedType = (el.tied) ? holder.length : -1;
		
	}); */
		
	return grown; 
}

function DoomFind(reduced){
	let holder = reduced.every(function(el, ind, arr){
		return el.score===arr[0].score;
	});
	
	return holder;
}

function Ranker(pri, pnt){
	const highest = pri.length-1; //highest score possible
	
	for(let sc=highest; sc>=0; sc--){ //checking every score possible, highest to lowest
		
		//Find Elements with a score of sc
		let holder = pri.filter(function(el){
			return el.score===sc;
		});
		let goFoward = false;
		
		switch(holder.length){
			case 0:
			break;
			
			case 1:
			Printer(holder[0].label, pnt);
			break;
			
			case 2:
			TiedTwo(holder[0], holder[1], pnt);
			break;
			
			default:
			goFoward = true;
			break;
		}
		
		if(goFoward){
			let cloned = DeepClone(holder);
			let doomCheck = DoomFind(cloned);
			
			if(doomCheck){
				let labelsOnly = [];
				for(let i=0; i<cloned.length; i++){
					labelsOnly.push(cloned[i].label);
				}
				Printer(labelsOnly, pnt);
			} else {
				Ranker(cloned, pnt);
			}
		}
	}
}

		
function NumCrunch (priorityList, pntD, pntE){
		//Tools to get and hold data
	var priObjL = [];
	var listEl = document.getElementsByTagName('select');
		//Pointers to send messages
	var resultPnt = document.getElementById(pntD);
	var errorPnt = document.getElementById(pntE);
		//Tools to avoid unnessary computations
	var goFuther = true;
	
	//Clearing past messages
	resultPnt.innerHTML = "";
	errorPnt.innerHTML = "";
	
	//Check that all the Compairsons have been made.
	var	cnt1 = listEl.length;
	for(let i=0; i<cnt1; i++){
		if(listEl[i].value == 'Undecided'){
			errorPnt.innerHTML = 'Please Finish the Comparisons';
			goFuther = false;
			break;	
		}
	}
	
	if(goFuther){ //This will not be calculated if all comparisons have not been made
		
		//Objects of Priority Data put in an Array and Filled With Data from listEL
		var stop = priorityList.length;
		for(let i=0; i<stop; i++){ //Loop Through Priorities
			let stuff = {
				label: priorityList[i],
				score: 0,
				wins: []
			};
			priObjL.push(stuff);
			
			//Set Array to track Wins
			for(let j=0; j<cnt1; j++){ //Loop Through All Comparisons
								
				let opVal = listEl[j].options; //Assume Collections Length is 3
				let attended = false; //To avoid unnessary computations
				
				//Find Out if This Selection j is a Comparison with priObjL[i] present
				for(let k=0; k<3; k++){ //Determin if attended Should be True
					if(priObjL[i].label===opVal[k].value){
						attended = true;
					}
				}
				
				//Set Value for Wins Array Elements and Store It
				if(attended){
					
					let thing = { //Elements for Wins Array
						match: '',
						vic: false
					};
					
					//Count Score for Each Element
					if(priObjL[i].label===listEl[j].value){
						priObjL[i].score++;
					}
					
					//Determine the Enemy
					for(let k=0; k<3; k++){
						if((opVal[k].value!="Undecided")&&(opVal[k].value!=priObjL[i].label)){
							thing.match = opVal[k].value;
						}
					}
					
					//Record if the Enemy was Defeated with TRUE
					if(thing.match!=listEl[j].value){ 
							thing.vic = true;
					}
					
					//Place Record in wins-Array
					priObjL[i].wins.push(thing);
				}
			}
		}
		
		//Check for Ties, i don't use ties anymore
		/*priObjL.forEach(function(el, ind, arr){
			let hold = arr.find(function(a, ind_a, arr_a){
						return (a.score===el.score)&&(ind!==ind_a);
			});
			
			el.tied = (hold!==undefined)? true : false;
		}); */
		
		Ranker(priObjL, resultPnt);
	}
}
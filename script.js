$body = $('body');
var root = $('.root')[0];
var parallax = $('.parallax')[0];
var checkBoxArray = [];
var symbolArray = [];
var datasets = [];
var dataObjects
var idVar;


$(document).ready(function () {
	localStorage.clear();
	$(document).on({
		ajaxStart: ajaxAdd,
		ajaxStop: ajaxRemove
	});
	getAllCoins();
	let aboutBtn = $('.about-btn')[0];
	aboutBtn.addEventListener('click', function (event) {
		$(parallax).hide();
		$(root).empty();
		buildAbout()
	});
	let reportsBtn = $('.reports-btn')[0];
	reportsBtn.addEventListener('click', function (event) {
		if (idVar)
			clearInterval(idVar)

		/** WORKS KILLS ALL LISTENERS */
		$(document).off({
			ajaxStart: ajaxAdd,
			ajaxStop: ajaxRemove
		});


		$(root).empty();
		createChart();
	});
	let searchBtn = $('.search-btn')[0];
	searchBtn.addEventListener('click', searchFilterClicked);
	// let homeBtn = $('.home-btn')[0];
	// homeBtn.addEventListener('click', function(event) {
	// 	$(root).empty();
	// });
});

//starts ajax loading 
function ajaxAdd() {
	$body.addClass('loading');
}

//stops ajax loading
function ajaxRemove() {
	$body.removeClass('loading');
}




//search term was clicked
function searchFilterClicked() {
	let allCards = $(root).find('.card');
	[...allCards].forEach(element => $(element).show());
	let searchInputValue = $('.search-input').val();

	if (searchInputValue == '') {
		//reset display
		return;
	}
	let wantedCards = $(root).find(`#${searchInputValue}`)[0];
	if (!wantedCards) {
		//reset display
		return;
	}
	if (!wantedCards && wantedCards.length < 1) {
		//reset display
		return;
	}
	[...allCards].forEach(element => {
		if (element != wantedCards) $(element).hide();
	});
}

function buildCard(coinObj) {
	let card = $(`<div class="card p-2 col-lg-4 col-md-6 col-sm-12" id=${coinObj.symbol}></div>`)[0];

	let label = $(`<label class="switch mt-1" id=${coinObj.symbol}></label>`)[0];
	let input = $(`<input type="checkbox" >`)[0];
	let span = $(`<span class="slider round"></span>`)[0];
	$(label)
		.append(input)
		.append(span);
	input.addEventListener('change', function (event) {
		// if (checkBoxArray.indexOf(label) > -1) {
		if (symbolArray.includes(label.id)) {
			//In the array!
			checkBoxArray.splice(checkBoxArray.indexOf(label), 1);
			symbolArray.splice(symbolArray.indexOf(label.id), 1);
		} else {
			//Not in the array
			if (checkBoxArray.length > 4) {
				moreThenFive(label.id, event.target);
			} else {
				checkBoxArray.push(label.cloneNode(true));
				symbolArray.push(label.id);
			}
		}
	});

	$(card).append(label);
	// $(card).append( $('<h3>'+coinObj.id+'</h3>')[0]);
	$(card).append($('<h4>' + coinObj.name + '</h4>')[0]);
	$(card).append($('<h6>' + coinObj.symbol + '</h6>')[0]);
	let moreInfoButton = $(
		`<div class="btn btn-info mb-1" id="infoBtn ${coinObj.id}" data-toggle="collapse" data-target="#demo${coinObj.id}">More Info<div/>`
	)[0];
	let moreInfoSpace = $(`<div id="demo${coinObj.id}" class="collapse"> </div>`)[0];

	moreInfoButton.addEventListener('click', function (event) {
		moreInfo(event, moreInfoSpace);
	});
	$(card).append(moreInfoButton);
	$(card).append(moreInfoSpace);
	return card;
}

function buildAllCards(result) {
	// var root = $('.root')[0];
	result.forEach(element => {
		root.appendChild(buildCard(element));
	});
}

//more then 5 coins were marked, popup window
function moreThenFive(currentCardId, checkbox) {
	$('.modal-body').empty();
	$(checkbox).prop('checked', !$(checkbox).prop('checked'));
	checkBoxArray.forEach(element => {
		let div = $('<div class="button-holder"></div>')[0];
		div.append(element);
		div.append(element.id);

		$('.modal-body')[0].append(div);
	});
	$('#exampleModal').modal('show');
}

//cancel was clicked on modal
function cancelModal() {
	//let origArray = $('.modal-body').find('.switch');
	//checkBoxArray = [...origArray];
	$('.modal-body').empty();
}

//save changes on modal
function saveModal() {
	let localCheckBoxArray = [];
	let localSymbolArray = [];
	let origArray = [];
	origArray = $('.modal-body').find('.switch');
	for (let i = 0; i < origArray.length; i++) {
		let checkbox = $(origArray[i]).find('input')[0];
		let bool = $(checkbox).is(':checked');
		if (bool) {
			localCheckBoxArray.push(origArray[i]);
		}
	}

	for (let i = 0; i < localCheckBoxArray.length; i++) {
		localSymbolArray.push(localCheckBoxArray[i].id);
	}
	//goten clicked modal switches
	let allSwitches = $(root).find('.switch');
	for (let i = 0; i < allSwitches.length; i++) {
		if (localSymbolArray.indexOf(allSwitches[i].id) == -1) {
			let input = allSwitches[i].children[0];
			$(input).prop('checked', false);
		}
	}

	checkBoxArray = [...localCheckBoxArray];
	symbolArray = [...localSymbolArray];
	$('#exampleModal').modal('hide');
	$('.modal-body').empty();
}

//more info was clicked
function moreInfo(e, moreInfoSpace) {
	let now = Date.now();
	$(moreInfoSpace).empty();
	let coinID = e.target.id.replace('infoBtn ', '');

	//if local storage is null it is the first iteration
	if (localStorage.getItem(coinID) === null) {
		getResultPerCoin(moreInfoSpace, coinID, now);
	} else {
		let localStorageObject = JSON.parse(localStorage.getItem(coinID));
		if (Date.now() - localStorageObject.time > 120000) {
			//2 minutes have passed
			getResultPerCoin(moreInfoSpace, coinID, now);
		} else {
			//2 minutes have not passed
			buildMoreInfo(moreInfoSpace, localStorageObject.result);
		}
	}
}

function getResultPerCoin(moreInfoSpace, coinID, now) {
	$.ajax({
		url: `https://api.coingecko.com/api/v3/coins/${coinID}`,
		success: function (res) {
			buildMoreInfo(moreInfoSpace, res);

			//build object to place in local storage
			let localStorageObject = {
				result: res,
				time: now.toString(),
			};

			window.localStorage.setItem(coinID, JSON.stringify(localStorageObject));
		},
		error: function () {
			alert('error!');
		},
	});
}

function buildMoreInfo(moreInfoSpace, res) {
	$(moreInfoSpace).empty();
	let image = $(`<div><img src="${res.image.small}"></img><div>`)[0];
	$(moreInfoSpace).prepend(image);
	let hr1 = $(`<hr><hr>`)[0];
	let usdPrice = $(`<div>Price in USD: ${res.market_data.current_price.usd}$</div>`)[0];
	let hr2 = $(`<hr><hr>`)[0];
	let eurPrice = $(`<div>Price in EUR: ${res.market_data.current_price.eur}€</div>`)[0];
	let hr3 = $(`<hr><hr>`)[0];
	let nisPrice = $(`<div>Price in NIS: ${res.market_data.current_price.ils}₪</div>`)[0];
	let hr4 = $(`<hr><hr>`)[0];
	$(moreInfoSpace).append(hr2);
	$(moreInfoSpace).append(usdPrice);
	$(moreInfoSpace).append(hr1);
	$(moreInfoSpace).append(eurPrice);
	$(moreInfoSpace).append(hr3);
	$(moreInfoSpace).append(nisPrice);
	$(moreInfoSpace).append(hr4);
}

function getAllCoins() {
	$(document).on({
		ajaxStart: ajaxAdd,
		ajaxStop: ajaxRemove
	});
	checkBoxArray = [];
	symbolArray = [];
	if (idVar)
		clearInterval(idVar)
	$(parallax).show();
	$('.root').empty();

	$.ajax({
		url: 'https://api.coingecko.com/api/v3/coins/list',
		success: function (res) {
			// var root=$('.root')[0];
			// $(root).append('<div class="row"></div>')[0]
			result = res.slice(0, 100);
			buildAllCards(result);
			// res.forEach(element => {
			// root.appendChild(buildCard(element));
			// });
		},
		error: function () {
			alert('error!');
		},
	});
}

//time functions
function time_format(d) {
	hours = format_two_digits(d.getHours());
	minutes = format_two_digits(d.getMinutes());
	seconds = format_two_digits(d.getSeconds());
	return hours + ':' + minutes + ':' + seconds;
}

function format_two_digits(n) {
	return n < 10 ? '0' + n : n;
}

//get random color
function getRandomColor() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

//about area
function buildAbout() {
	let imgDiv = $('<img src="./About.jpg" class="about_img mt-5 col-2"></img>')
	let aboutDiv = $('<div class=mt-5 col-10>Yevgeny Bendersky is awesome <br> Inventor of air and cheese <br>First man to walk on the sun <br>Husband to Margo Robbie and father to Peter Parker <br> Greatest ruler Chechnia has ever seen </div>')
	$(root).append(imgDiv).append(aboutDiv)
}


/**Chart area! */
//main chart func
function createChart() {
	if (symbolArray.length > 0) {
		//timestamps / labels
		var timeLabels = [];
		//data objects
		datasets = []
		dataObjects
		//remove paralex
		$(parallax).hide();
		//add caparallaxnvas
		$(root).append('<canvas id="myChart"></canvas>');

		var d = new Date();
		var formatted_time = time_format(d);
		timeLabels.push(formatted_time)

		//new chart creation
		var ctx = document.getElementById('myChart').getContext('2d');
		var chart = new Chart(ctx, {
			// The type of chart we want to create
			type: 'line',

			// The data for our dataset
			data: {
				labels: timeLabels,
				datasets: datasets,
			},

			// data: {
			// 	labels: timeLabels,
			// 	datasets: [
			// 		{
			// 			label: 'My First dataset',
			// 			backgroundColor: 'rgb(255, 99, 132)',
			// 			borderColor: 'rgb(255, 99, 132)',
			// 			fill: false,
			// 			data: [0, 10, 5, 2, 20, 30, 45],
			// 		},
			// 		{
			// 			label: 'My Second dataset',
			// 			backgroundColor: 'rgb(11, 22, 132)',
			// 			borderColor: 'rgb(11, 22, 132)',
			// 			fill: false,
			// 			data: [10, 13, 25, 32, 12, 30, 45],
			// 		},
			// 	],
			// },

			// Configuration options go here
			options: {
				animation: { duration: 1000 * 1, easing: "linear" }
			},
		});

		var d = new Date();
		var formatted_time = time_format(d);
		timeLabels.push(formatted_time)
		getCurrentPrice(timeLabels, chart)

		//will run on setinterval()
		idVar = setInterval(() => {
			var d = new Date();
			var formatted_time = time_format(d);
			if (timeLabels.length>10)
			timeLabels.shift();
			timeLabels.push(formatted_time)
			getCurrentPrice(timeLabels, chart)
		}, 1000)
		//getCurrentPrice(timeLabels);
	}
	else {
		$(parallax).hide();
		$(root).append(`<div class="alert alert-danger col-12 mt-5 text-center">No coins selected, no graph will be shown, go home!</div>`)
	}
}


//get current price for Xcoins
function getCurrentPrice(timeLabels, chart) {
	let coinSymbolsString = symbolArray.join();
	let fullURL = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${coinSymbolsString}&tsyms=USD`;
	//min-api.cryptocompare.com/data/pricemulti?fsyms=ETH,BTC&tsyms=USD
	$.ajax({
		url: fullURL,
		success: function (res) {
			if (res) drawChart(res, timeLabels, chart);
		},
		error: function () {
			alert('error!');
		},
	});
}

//actualdraw chart func
function drawChart(res, timeLabels, chart) {
	try {
		let datasets = buildDataSets(res)
		chart.data.labels = timeLabels;
		chart.data.datasets = datasets;
		chart.update(1000)

		// var ctx = document.getElementById('myChart').getContext('2d');
		// var chart = new Chart(ctx, {
		// 	// The type of chart we want to create
		// 	type: 'line',

		// 	// The data for our dataset
		// 	data: {
		// 		labels: timeLabels,
		// 		datasets: datasets,
		// 	},

		// 	// data: {
		// 	// 	labels: timeLabels,
		// 	// 	datasets: [
		// 	// 		{
		// 	// 			label: 'My First dataset',
		// 	// 			backgroundColor: 'rgb(255, 99, 132)',
		// 	// 			borderColor: 'rgb(255, 99, 132)',
		// 	// 			fill: false,
		// 	// 			data: [0, 10, 5, 2, 20, 30, 45],
		// 	// 		},
		// 	// 		{
		// 	// 			label: 'My Second dataset',
		// 	// 			backgroundColor: 'rgb(11, 22, 132)',
		// 	// 			borderColor: 'rgb(11, 22, 132)',
		// 	// 			fill: false,
		// 	// 			data: [10, 13, 25, 32, 12, 30, 45],
		// 	// 		},
		// 	// 	],
		// 	// },

		// 	// Configuration options go here
		// 	options: {},
		// });
	}
	catch (exception) {

	}
}

//create the changing datasets object for the graphs
function buildDataSets(res) {

	if (datasets.length == 0) {


		Object.keys(res).forEach(element => {
			let coinName = element;
			let coinPrice = res[element]["USD"];

			let dataObject = {
				label: `Coin Id ${coinName}`,
				backgroundColor: getRandomColor(),
				borderColor: getRandomColor(),
				fill: false,
				data: [coinPrice],
			}
			datasets.push(dataObject);
		});
	}
	else {
		for (let i = 0; i < datasets.length; i++) {
			let coinPrice = res[Object.keys(res)[i]]["USD"];
			if (datasets[i].data.length>10)
			datasets[i].data.shift();
			datasets[i].data = [...datasets[i].data, coinPrice]
			//datasets[i].data.push(Math.floor(Math.random() * 100));
			//datasets.push(dataObject);
		}
		// Object.keys(res).forEach(element => {
		// 	let coinName = element;
		// 	let coinPrice = res[element]["USD"];

		// 	let dataObject = {
		// 		label: `Coin Id ${coinName}`,
		// 		backgroundColor: getRandomColor(),
		// 		borderColor: getRandomColor(),
		// 		fill: false,
		// 		data: [...data,coinPrice],
		// 	}
		// 	datasets.push(dataObject);
		// });	
	}
	return datasets;
}

/**Chart area! */
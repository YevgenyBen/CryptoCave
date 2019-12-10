$body = $('body');
var root = $('.root')[0];
var checkBoxArray = [];
$(document).ready(function() {
	$(document).on({
		ajaxStart: function() {
			$body.addClass('loading');
		},
		ajaxStop: function() {
			$body.removeClass('loading');
		},
	});
	getAllCoins();
	let aboutBtn = $('.about-btn')[0];
	aboutBtn.addEventListener('click', function(event) {
		$(root).empty();
	});
	let reportsBtn = $('.reports-btn')[0];
	reportsBtn.addEventListener('click', function(event) {
		$(root).empty();
	});
	// let homeBtn = $('.home-btn')[0];
	// homeBtn.addEventListener('click', function(event) {
	// 	$(root).empty();
	// });
});

function buildCard(coinObj) {
	let card = $(`<div class="card p-2 col-lg-4 col-md-6 col-sm-12" id=${coinObj.symbol}></div>`)[0];
	let label = $(`<label class="switch mt-1"></label>`)[0];
	let input = $(`<input type="checkbox" id=${coinObj.symbol}>`)[0];
	input.addEventListener('change', function(event) {
		if (checkBoxArray.indexOf(label.cloneNode(true)) > -1) {
			//In the array!
			checkBoxArray.splice(checkBoxArray.indexOf(label.cloneNode(true)), 1);
		} else {
			//Not in the array
			if (checkBoxArray.length > 4) {
				moreThenFive(label.cloneNode(true), event.target);
			} else checkBoxArray.push(label.cloneNode(true));
		}
	});
	let span = $(`<span class="slider round"></span>`)[0];
	$(label)
		.append(input)
		.append(span);
	$(card).append(label);
	// $(card).append( $('<h3>'+coinObj.id+'</h3>')[0]);
	$(card).append($('<h4>' + coinObj.name + '</h4>')[0]);
	$(card).append($('<h6>' + coinObj.symbol + '</h6>')[0]);
	let moreInfoButton = $(
		`<div class="btn btn-info mb-1" id="infoBtn ${coinObj.id}" data-toggle="collapse" data-target="#demo${coinObj.id}">More Info<div/>`
	)[0];
	let moreInfoSpace = $(`<div id="demo${coinObj.id}" class="collapse"> </div>`)[0];

	moreInfoButton.addEventListener('click', function(event) {
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
	$(checkbox).prop('checked', !$(checkbox).prop('checked'));
	checkBoxArray.forEach(element => {
		$('.modal-body')[0].append(element);
	});
	$('#exampleModal').modal('show');
}

//more info was clicked
function moreInfo(e, moreInfoSpace) {
	let now = Date.now();
	$(moreInfoSpace).empty();
	let coinID = e.target.id.replace('infoBtn ', '');

	//if local storage is null it is the first iteration
	if (localStorage.getItem(now.toString() + coinID) === null) {
		getResultPerCoin(moreInfoSpace, coinID, now.toString());
	}
	//if not need to add retrieve more info from local storage
	getResultPerCoin(moreInfoSpace, coinID, now.toString());
}

function getResultPerCoin(moreInfoSpace, coinID, now) {
	$.ajax({
		url: `https://api.coingecko.com/api/v3/coins/${coinID}`,
		success: function(res) {
			buildMoreInfo(moreInfoSpace, res);
			window.localStorage.setItem(now.toString() + coinID, res);
		},
		error: function() {
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
	$('.root').empty();

	$.ajax({
		url: 'https://api.coingecko.com/api/v3/coins/list',
		success: function(res) {
			// var root=$('.root')[0];
			// $(root).append('<div class="row"></div>')[0]
			result = res.slice(0, 100);
			buildAllCards(result);
			// res.forEach(element => {
			// root.appendChild(buildCard(element));
			// });
		},
		error: function() {
			alert('error!');
		},
	});
}

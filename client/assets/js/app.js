var DemoFormWizard = function() {
	// Create reference to this instance
	var o = this;
	// Initialize app when document is ready
	$(document).ready(function() {
		o.initialize();
	});

};
var p = DemoFormWizard.prototype;
var isOpen = false;

$(document).on("click", ".form-wizard-nav ul li a", function(event) {
	$('#rootwizard2').bootstrapWizard({
		onTabClick: function(tab, navigation, index) {
			return false;
		}
	})
})

$(document).on('change', '#toggle-passport input:radio', function(event) {
	var radio = $(this);
})

$(document).on("click", "a.triggerswal", function(event) {
	bvn_url_check = './api/v1/bvn_validation/';
	swal({
		text: 'Do you have a bank verification number (BVN)?',
		input: 'number',
		showCancelButton: true,
		confirmButtonText: 'Submit',
		cancelButtonText:'Skip BVN check',
		showLoaderOnConfirm: true,
		inputPlaceholder:'Enter your BVN',
		inputValidator: function (bvn) {
			return new Promise(function (resolve, reject) {
				if (bvn) {
					resolve()
				} else {
					reject('BVN cannot be left empty, Skip if you don\'t have')
				}
			})
		},
		allowOutsideClick: false,
		onClose: function(bvn) {
			$('#formModal').modal('show');
		},
		preConfirm: function (bvn) {
			return new Promise(function (resolve, reject) {
				// setTimeout(function() {
				// 	if (bvn === '12345') {
				// 		reject('This email is already taken.')
				// 	} else {
				// 		resolve()
				// 	}
				// }, 2000)

				$.ajax({url:bvn_url_check+bvn, type:'GET', 
					success:function(response) {
						console.log(bvn_url_check+bvn)
						console.log(response)
						console.log(response.bvn_found)
						if(response.bvn_found) {
							swal({
								text: 'Bvn found, populating form with details...',
								timer: 3000
							}).then(
								function () {},
								// handling the promise rejection
								function (dismiss) {
									if (dismiss === 'timer') {
										resolve()
									}
								}
							)
						} else {
							swal({
								text: 'No bvn details found, Kindly fill the form to complete your account opening',
								timer: 3000
							}).then(
								function () {},
								// handling the promise rejection
								function (dismiss) {
									resolve()
								}
							)
						}
					}
				})
			})
		},
	}).then(function (bvn) {
		
	})

	event.preventDefault()
})

$(document).on("click", "li.next", function(event) {
	$('#rootwizard2').bootstrapWizard({
		onTabClick: function(tab, navigation, index) {
			return false;
		},

		onTabShow: function(tab, navigation, index) {
			handleTabShow(tab, navigation, index, $('#rootwizard2'));
		},

		onNext: function(tab, navigation, index) {
			var form = $('#rootwizard2').find('form.form-validation');
			var valid = form.valid();
			if(!valid) {
				form.data('validator').focusInvalid();
				return false;
			}

			var current_index = $('#rootwizard2').bootstrapWizard('currentIndex');
			var tab_length = $('#rootwizard2').bootstrapWizard('navigationLength');
			
			$("#formModal").animate({ scrollTop: 0 }, "slow");
			if((current_index + 1)  == tab_length) {
				$("ul.wizard").find("li.finish").removeClass("hide");
			} else {
				$("ul.wizard").find("li.finish").addClass("hide");
			}
			

		}
	});
})

$(document).on("click", "input[type='submit']", function(event) {
	var form = $(this).parents("form.form-validation");
	var valid = form.valid();

	if(!valid) {
		form.data('validator').focusInvalid();
		return false;
		event.preventDefault();
	}
})

handleTabShow = function(tab, navigation, index, wizard){
	var total = navigation.find('li').length;
	var current = index + 0;
	var percent = (current / (total - 1)) * 100;
	var percentWidth = 100 - (100 / total) + '%';
	
	navigation.find('li').removeClass('done');
	navigation.find('li.active').prevAll().addClass('done');
	
	wizard.find('.progress-bar').css({width: percent + '%'});
	$('.form-wizard-horizontal').find('.progress').css({'width': percentWidth});
};

$(document).ready(function(){
	$(".nano").nanoScroller();
	$(".boot-tooltip").tooltip();
	
	
	var width = $("div#offcanvas-width").width();
	$("div#offcanvas-width").attr("data-width", width);
	
    $("#owl-slider").owlCarousel({
        loop:false,
        margin:10,
        nav:true,
        dots:false,
        autoplay:true,
        autoplayTimeout:15000,
        autoplayHoverPause:true,
        responsive:{
            0:{
                items:1
            },
            600:{
                items:3
            },
            1000:{
                items:3
            }
        }
    });
});


$(document).on("click", "#open-button, .close-button", function(event) {
	toggleMenu();
})

$(document).on("click",".content-wrap", function(event) {
	var target = event.target;
	if( isOpen && target !== document.getElementById( 'open-button' )) {
		toggleMenu();
	}
})

function toggleMenu() {
	if( isOpen ) {
		//$(".menu-wrap").addClass("hide");
		//classie.remove( bodyEl, 'show-menu' )
		$("body").removeClass('show-menu');
	}
	else {
		$("body").addClass('show-menu');
		//classie.add( bodyEl, 'show-menu');
		//$(".menu-wrap").removeClass("hide");
	}
	isOpen = !isOpen;
}

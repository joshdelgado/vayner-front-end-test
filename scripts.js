$(function() {
	console.log('ready!');

    /**
     * Define areas where dropping is allowed
     */
    window.allowDrop = function(ev) {
        ev.preventDefault();
    }

    /**
     * Define id of dragged element
     */
    window.drag = function(ev) {
        let ids = [],
			//titles = [];
            parent = $('#'+ev.target.id).parent().attr('id');

        if( $('#'+ev.target.id).find('input').prop('checked') == false ){
            $('#'+ev.target.id).find('input').prop('checked', true);
        }

		console.log('select');
        console.log( parent );
        $('#'+ev.target.id).parent().find('input[type=checkbox]:checked').each(function(index, value){
			console.log($(this));
            ids.push( $(this).parents('.table__row').attr('id') );
			//titles.push( $(this).parent().children('.album-title').html() );
        });

		ids = ids.filter( Boolean );
		//titles = titles.filter( Boolean );

        ev.dataTransfer.setData('id', ids);
		ev.dataTransfer.setData('origin', parent);
        //ev.dataTransfer.setData('title', titles);
        //console.log(ids);
        //console.log( parent );
        $('.table:not(#'+parent+')').addClass('draghere');
    }

    /**
     * Drop selected object
     */
    window.drop = function(ev, el) {
        ev.preventDefault();
        let ids = ev.dataTransfer.getData('id').split(','),
			origin = ev.dataTransfer.getData('origin');
        //console.log(ids);
        $('.table').removeClass('draghere');
		if( origin == el.id ){
			//console.log("same!!!!");
			return;
		}

        ids.forEach(function(id, index){
            //console.log(id);
            $('#'+id).removeClass('selected');
			$('#'+id).find('input').prop('checked', false);

            let album_id = id.substring( id.indexOf("__")+2 ),
                album_title = $('#'+id+" div.album-title").html(),
                target_user = el.id.substr(-1);
            //console.log(el);
            //console.log(target_user);
            //console.log(index+": "+id);

            $.ajax({
    			url: root+"albums/"+album_id,
    			type: 'PUT',
                data: {
                    userId: target_user,
                    id: id,
                    title: album_title
                },
    			success: function(result){
                    console.log("success");
                    console.log(result);
                    document.getElementById("user"+result.userId).appendChild( document.getElementById(id) );
                },
                error: function( jqXhr, textStatus, errorThrown ){
                    console.log(errorThrown);
                }
            });
        });
        //$('.table__row').removeClass('selected');
        //$(this).children('input').prop('checked', false);
    }

    /**
     * Initializing function
     */
	init = function(){
		get_users();
	}

	/**
     * Requests all user data and store in variable
     */
	get_users = function(){
		$.ajax({
			url: root+'users',
			type: 'GET',
			success: function(result){
				console.log("success");
				user_data = result;
				console.log(user_data);
			},
			error: function( jqXhr, textStatus, errorThrown ){
				console.log(errorThrown);
			},
			complete: function(data){
				get_albums();
			}
		});
	}

	/**
     * Requests all album data and store in variable
     */
	get_albums = function(){
		$.ajax({
			url: root+'albums',
			type: 'GET',
			success: function(result){
				console.log("success");
                all_albums = result;
                for (var i = 1; i <= 10; i++) {
                    $('main').append('<div class="usercard"><h2 class="usercard__user"> '+user_data[i-1].name+'</h2><!--<button class="usercard__button" type="button" data-user="1">+</button>--><div class="search"><div class="search__input-wrap"><input class="search__input" type="text" required></input><label class="search__label">Search</label></div><button class="search__button" type="submit" data-user="'+i+'">	&rarr;</button></div><div class="table nodrag" id="user'+i+'" ondrop="drop(event, this)" ondragover="allowDrop(event)">');
                    display_albums(i);
                }
			},
			error: function( jqXhr, textStatus, errorThrown ){
				console.log(errorThrown);
			}
		});
	}

    /**
     * Display all albums for user
     * @param {Number} user
	 * @param {Array} filtered_albums
     */
    display_albums = function(user, filtered_albums){
        albums = all_albums.filter(cell => cell.userId == user);
        if( filtered_albums ){
            albums = filtered_albums;
            //console.log(falbums);
        }
        $('#user'+user).empty();
        $('#user'+user).append("<div class='table__overlay'><span>Drop Here</span></div><div class='table__row table__header flex'><div class='table__cell table__cell--short'>Id</div><div class='table__cell'>Title</div><div class='table__cell--inherit'><input class='table__selectall' type='checkbox' data-user='user"+user+"'></div></div>");
        console.log(albums);
        for (let i = 0; i < albums.length; i++) {
            //console.log(albums[i].id+" "+albums[i].title);
            $('#user'+user).append("<div id='album__"+albums[i].id+"' class='table__row' draggable='true' ondragstart='drag(event)'><div class='table__cell table__cell--short'>"+albums[i].id+"</div><div class='table__cell table__cell album-title'>"+albums[i].title+"</div><div class='table__cell table__cell--inherit'><input class='table__checkbox' type='checkbox'></div></div>");
        }
    }

	/**
     * Search for albums based on string input
     * @param {string} string
	 * @param {Number} user
     */
    search_albums = function(string, user){
        let filtered_albums = all_albums.filter(
            cell => cell.title.includes(string) == true && cell.userId == user
        );
        display_albums(user, filtered_albums)
        //console.log(filtered_albums);
    }

	/**
     * Event Listeners
     */
    $(document).on('click', '.search__button', function(ev){
        ev.preventDefault;
        let string = $(this).parent('.search').find('.search__input').val(),
            user = $(this).attr('data-user');
        console.log(string+" "+user);
        search_albums(string, user);
    });

    $(document).on('mousedown', '.table__row:not(.table__header)', function(){
        $(this).toggleClass('selected');
        if( $(this).find('input').prop('checked') == false ){
            $(this).find('input').prop('checked', true);
        } else {
            $(this).find('input').prop('checked', false);
        }
    });

	$(document).on('change', '.table__selectall', function(){
		let user = $(this).attr('data-user'),
			checked = $(this).prop('checked');

		//console.log(user+" "+checked);
		$('#'+user).find('input').prop('checked', checked);
		if( checked == true ){
			$('#'+user).find('.table__row').addClass('selected');
		} else {
			$('#'+user).find('.table__row').removeClass('selected');
		}
	});

	$(document).on('focusin', '.search__input', function(){
		$(this).addClass('active');
	}).on('focusout', '.search__input', function(){
		if( !$(this).val() ){
			$(this).removeClass('active');
		}
	});

	$(document).on('click', '.usercard__button', function(){
		$(this).toggleClass('closed');
		$(this).parent('.usercard').toggleClass('hidden');
	})

	const root = 'https://jsonplaceholder.typicode.com/';
	let all_albums,
		user_data;

	init();
});

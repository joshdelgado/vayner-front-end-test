$(function() {
	const root = 'https://jsonplaceholder.typicode.com/';
	let all_albums,
		user_data;

	/**
	 * Initializing function
	 */
	init = function(){
		get_users();
	}

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
            parent = $('#'+ev.target.id).parent().attr('id');

        if( $('#'+ev.target.id).find('input').prop('checked') == false ){
            $('#'+ev.target.id).find('input').prop('checked', true);
        }

        $('#'+ev.target.id).parent().find('input[type=checkbox]:checked').each(function(index, value){
            ids.push( $(this).parents('.table__row').attr('id') );
        });

		ids = ids.filter( Boolean );

        ev.dataTransfer.setData('id', ids);
		ev.dataTransfer.setData('origin', parent);
        $('.table:not(#'+parent+')').addClass('draghere');
    }

    /**
     * Drop selected object
     */
    window.drop = function(ev, el) {
        ev.preventDefault();
        let ids = ev.dataTransfer.getData('id').split(','),
			origin = ev.dataTransfer.getData('origin');
        $('.table').removeClass('draghere');
		if( origin == el.id ){
			return;
		}

        ids.forEach(function(id, index){
            $('#'+id).removeClass('selected');
			$('#'+id).find('input').prop('checked', false);

            let album_id = id.substring( id.indexOf('__')+2 ),
                album_title = $('#'+id+' div.album-title').html(),
                target_user = el.id.substr(4);

            $.ajax({
    			url: root+"albums/"+album_id,
    			type: 'PUT',
                data: {
                    userId: target_user,
                    id: id,
                    title: album_title
                },
    			success: function(result){
                    document.getElementById("user"+result.userId).appendChild( document.getElementById(id) );
                },
                error: function( jqXhr, textStatus, errorThrown ){
                    console.log(errorThrown);
                }
            });
        });
    }

	/**
     * Requests all user data and store in variable
     */
	get_users = function(){
		$.ajax({
			url: root+'users',
			type: 'GET',
			success: function(result){
				user_data = result;
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
                all_albums = result;
                for (var i = 1; i <= 10; i++) {
                    $('main').append('<div class="usercard"><h2 class="usercard__user"> '+user_data[i-1].name+'</h2><div class="search alt"><div class="search__input-wrap"><input class="search__input" placeholder="Search" type="text" required></input><label class="search__label">Search</label></div><button class="search__button" type="submit" data-user="'+i+'">&rarr;</button></div><div class="table nodrag" id="user'+i+'" ondrop="drop(event, this)" ondragover="allowDrop(event)">');
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
        }
        $('#user'+user).empty();
        $('#user'+user).append("<div class='table__overlay'><span>Drop Here</span></div><div class='table__row table__header flex'><div class='table__cell table__cell--short'>Id</div><div class='table__cell'>Title</div><div class='table__cell--inherit'><input class='table__selectall' type='checkbox' data-user='user"+user+"'></div></div>");
        for (let i = 0; i < albums.length; i++) {
            $('#user'+user).append("<div id='album__"+albums[i].id+"' class='table__row' draggable='true' ondragstart='drag(event)'><div class='table__cell table__cell--short'>"+albums[i].id+"</div><div class='table__cell table__cell album-title'>"+albums[i].title+"</div><div class='table__cell table__cell--inherit'><input class='table__checkbox' type='checkbox'></div></div>");
        }
    }

	/**
     * Search for albums based on string input
     * @param {string} string
	 * @param {Number} user
     */
    search_albums = function(string, user){
		$('#user'+user+" .table__row:not('.table__header')").each(function(){
			let title = $(this).children('.album-title').html();
			$(this).removeClass('hidden');
			if( !title.includes(string) ){
				console.log( title );
				$(this).addClass('hidden');
			}
		});
    }

	/**
     * Event Listener - Search Albums
     */
    $(document).on('click', '.search__button', function(ev){
        ev.preventDefault;
        let string = $(this).parent('.search').find('.search__input').val(),
            user = $(this).attr('data-user');
        search_albums(string, user);
    });

	/**
	 * Event Listener - Select albums
	 */
    $(document).on('mousedown', '.table__row:not(.table__header)', function(){
        $(this).toggleClass('selected');
        if( $(this).find('input').prop('checked') == false ){
            $(this).find('input').prop('checked', true);
        } else {
            $(this).find('input').prop('checked', false);
        }
    });

	/**
	 * Event Listener - Select/Deselect all albums
	 */
	$(document).on('change', '.table__selectall', function(){
		let user = $(this).attr('data-user'),
			checked = $(this).prop('checked');

		$('#'+user).find('.table__row').each(function(){
			console.log( $(this).hasClass('hidden') );
			if( checked == true && !$(this).hasClass('hidden') ){
				$(this).addClass('selected');
				$(this).find('input').prop('checked', true);
			} else {
				$(this).removeClass('selected');
				$(this).find('input').prop('checked', false);
			}
		});
	});

	init();
});

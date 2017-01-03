gwult = gwult || {};

gwult.ActiveVoteContainer =  new function() {
    var activeVoteName = $('.active-votes-container .active-vote-name');
    var EventsHandler = gwult.EventsHandler;

    function set(name) {
        activeVoteName.text(name);
    }

    function remove() {
        activeVoteName.text('Не выбрано');
    }

    function onVoteSet(vote) {
        var name = vote.name;
        name ? set(name) : remove();
    }

    this.init = function() {
        EventsHandler.subscribe('vote-update-selected', onVoteSet);
    };
};
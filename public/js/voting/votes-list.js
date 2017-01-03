gwult = gwult || {};

gwult.VotesList =  new function() {
    var Vote = gwult.VoteEntity;
    var EventsHandler = gwult.EventsHandler;
    var RequestHelper = gwult.RequestHelper;

    var votes = [];
    var votesContainer = $('.votes-list-container .votes-list');

    function add(data) {
        votes.push(data);
        votesContainer.append(new Vote(data).getView());
    }

    function setActivity(data) {
        RequestHelper.setVoteActivity({id: data.id, isActive: data.isActive }).then(function() {

            buildVotes();
        });
    }

    function remove(data) {
        RequestHelper.removeVote({id: data.id }).then(buildVotes);
    }

    function getSelectedVote(votes) {
        return votes.filter(function(vote) { return vote.isActive; })[0] || {};
    }

    function buildVotes() {
        votesContainer.html('');
        RequestHelper.getVotes().then(function(votes) {
            votes.forEach(add);
            EventsHandler.publish('vote-update-selected', getSelectedVote(votes));
        });
    }

    this.build = function() {
        EventsHandler.subscribe('vote-add', buildVotes);
        EventsHandler.subscribe('vote-set-active', setActivity);
        EventsHandler.subscribe('vote-remove', remove);
        buildVotes();
    };
};
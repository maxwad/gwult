(function(gwult) {
    var VotesManager = gwult.VotesManager;
    var ActiveVoteContainer = gwult.ActiveVoteContainer;
    var VotesList = gwult.VotesList;

    function init() {
        VotesManager.build();
        VotesList.build();
        ActiveVoteContainer.init();
    }

    init();
})(window.gwult);
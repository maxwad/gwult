gwult = gwult || {};

gwult.RequestHelper = new function() {
    function getMappedVotes(votes) {
        var votesMap = votes.reduce(function(map, curr) {
            var vote = map[curr.id] || {};
            vote.name = vote.name || curr.vote_name;
            vote.isActive = vote.isActive || !!curr.is_active;
            vote.options = (vote.options || []).concat({ id: curr.option_id, name: curr.option_name, num: curr.num });
            map[curr.id] = vote;
            return map;
        }, {});
        return Object.keys(votesMap).sort(function(a, b) { return a - b; }).map(function(id) {
            var vote = votesMap[id];
            vote.id = id;
            return vote;
        });
    }

    this.addVote = function(voteData) {
        return $.ajax({ url: 'add_vote', method: 'POST', data: voteData });
    };

    this.removeVote = function(voteData) {
        return $.ajax({ url: 'remove_vote', method: 'POST', data: voteData });
    };

    this.setVoteActivity = function(voteData) {
        return $.ajax({ url: 'set_vote_active', method: 'POST', data: voteData });
    };

    this.getVotes = function() {
        return $.ajax({ url: 'get_votes', method: 'GET' }).then(getMappedVotes);
    };
};
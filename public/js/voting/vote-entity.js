gwult = gwult || {};

gwult.VoteEntity = function(data) {
    var EventsHandler = gwult.EventsHandler;

    function onChangeActivity(vote) {
        EventsHandler.publish('vote-set-active', { id: vote.id, isActive: !vote.isActive });
    }

    function onRemove(voteId) {
        EventsHandler.publish('vote-remove', { id: voteId });
    }

    function getOptions(options) {
        return options.reduce(function(wrapper, option) {
            var optionSection = $('<div></div>').addClass('vote-option').text(option.name),
                votedSection = $('<div></div>').addClass('voted-num').text('Проголосовало: ' + option.num);

            return wrapper.add(optionSection.append(votedSection));
        }, $());
    }

    function getChangeActivityButton(vote) {
        var buttonLabel = 'Сделать ' + (vote.isActive ? 'не' : '') + 'активным';
        return $('<div></div>').addClass('activity-section').html(function() {
            return $('<button></button>').text(buttonLabel).click(function () { onChangeActivity(vote); });
        });
    }

    function getRemoveVoteButton(vote) {
        return $('<div></div>').addClass('delete-section').html(function() {
            return $('<button></button>').text('Удалить').click(function () { onRemove(vote.id) });
        });
    }

    function getView(vote) {
        var header = $('<h4></h4>').addClass('vote-name').text(vote.name);
        return $('<div></div>')
            .addClass('vote-item')
            .toggleClass('active', vote.isActive)
            .append(header)
            .append(getChangeActivityButton(vote))
            .append(getRemoveVoteButton(vote))
            .append(getOptions(vote.options));
    }


    this.getView = function () {
        return getView(data);
    };
};
gwult = gwult || {};

gwult.VotesManager =  new function() {
    const initOptionsNum = 3;

    var EventsHandler = gwult.EventsHandler;
    var RequestHelper = gwult.RequestHelper;

    var container = $('.voting-container');
    var optionsContainer = container.find('.voting-form-options');
    var addOptionButton = container.find('button[data-action="add-option"]');
    var saveButton = container.find('button[data-action="save"]');
    var resetButton = container.find('button[data-action="reset"]');

    function getOption() {
        return $('<div></div>')
            .addClass('voting-form-section vote-option')
            .html('<label><span>Вариант</span><input type="text"></label>');
    }

    function getVoteModel() {
        var nameEl = container.find('.vote-name input'),
            optionsEls = container.find('.vote-option input'),
            options = $.map(optionsEls, function (el) { return $(el).val(); });

        return { name: nameEl.val(), options: options };
    }

    function appendOption() {
        optionsContainer.append(getOption());
    }

    function add() {
        var vote = getVoteModel();
        RequestHelper.addVote(vote).then(function() {
            EventsHandler.publish('vote-add', {});
            resetButton.click();
        });
    }

    this.build = function() {
        var count = initOptionsNum;
        while(count--) { appendOption(); }

        saveButton.click(add);
        addOptionButton.click(appendOption);
    };
};
gwult = gwult || {};

gwult.EventsHandler = new function() {
    var eventsTable = {};

    this.publish = function(eventName, data) {
        (eventsTable[eventName] || []).forEach(function(handler) { handler(data); });
    };

    this.subscribe = function(eventName, handler) {
        var events = eventsTable[eventName];
        eventsTable[eventName] = (events || []).concat(handler);
    };
}();
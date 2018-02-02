$(document).ready(function () {

    // Scrape button get req on main.handlebars
    $("#scrape").on("click", function () {
        $.ajax({
            type: "GET",
            dataType: "json",
            data: source,
            url: '/api/scrape', // url of Api controller not mvc
            success: function (data) {
                alert("Successful scrape");
            }
        }).done(function(data) {
            if (err) throw err;
            console.log(data);
            window.location ="/";
        });
    });
    

});
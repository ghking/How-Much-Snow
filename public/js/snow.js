$(document).ready(function()
{
    (function()
    {
        var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };

        window.requestAnimationFrame = requestAnimationFrame;
    })();

    var flakes = [];
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var flakeCount = $(window).width() * 0.32;
    var mX = -100;
    var mY = -100;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    canvas.addEventListener("mousemove", function(e)
    {
        mX = e.clientX,
        mY = e.clientY
    });

    window.addEventListener("resize",function()
    {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    })

    getLocationAndGetSnowfall();

    function getLocationAndGetSnowfall()
    {
        navigator.geolocation.getCurrentPosition(function(position)
        {
            getSnowfall(position);
        },
        function(error)
        {
            showError();
        });
    }

    function getSnowfall(position)
    {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;

        $.ajax({
            url: "forecast?latitude=" + latitude + "&longitude=" + longitude,
            success: function (response)
            {
                populate(response.accumulation, response.units);
            },
            error: function()
            {
                showError();
            }
        })
    }

    function populate(accumulation, units)
    {
        if (accumulation != 0)
        {
            startSnow();
        }

        showSnowfallAccumulation(accumulation, units);
    }

    function showError()
    {
        $("#spinner").hide();
        $("#sad-face").show();
        alert("Oh no! Something went wrong.");
    }

    function showSnowfallAccumulation(accumulation, units)
    {
        $('#accumulation').text(accumulation);
        $('#units').text(units);

        $("#spinner").hide();
        $("#snowfall-container").fadeTo(500, 1);
    }

    function snow()
    {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (var i = 0; i < flakeCount; i++)
        {
            var flake = flakes[i],
            x = mX,
            y = mY,
            minDist = 150,
            x2 = flake.x,
            y2 = flake.y;

            var dist = Math.sqrt((x2 - x) * (x2 - x) + (y2 - y) * (y2 - y)),
            dx = x2 - x,
            dy = y2 - y;

            if (dist < minDist)
            {
                var force = minDist / (dist * dist),
                xcomp = (x - x2) / dist,
                ycomp = (y - y2) / dist,
                deltaV = force / 2;

                flake.velX -= deltaV * xcomp;
                flake.velY -= deltaV * ycomp;

            }
            else
            {
                flake.velX *= .98;

                if (flake.velY <= flake.speed)
                {
                    flake.velY = flake.speed
                }
            }

            ctx.fillStyle = "rgba(255,255,255," + flake.opacity + ")";
            flake.y += flake.velY;
            flake.x += flake.velX;

            if (flake.y >= canvas.height || flake.y <= 0)
            {
                reset(flake);
            }


            if (flake.x >= canvas.width || flake.x <= 0)
            {
                reset(flake);
            }

            ctx.beginPath();
            ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
            ctx.fill();
        }

        requestAnimationFrame(snow);
    };

    function reset(flake)
    {
        flake.x = Math.floor(Math.random() * canvas.width);
        flake.y = 0;
        flake.size = (Math.random() * 3) + 2;
        flake.speed = (Math.random() * 1) + 0.5;
        flake.velY = flake.speed;
        flake.velX = 0;
        flake.opacity = (Math.random() * 0.5) + 0.3;
    }

    function startSnow()
    {
        for (var i = 0; i < flakeCount; i++)
        {
            var x = Math.floor(Math.random() * canvas.width),
            y = Math.floor(Math.random() * canvas.height),
            size = (Math.random() * 4) + 2,
            speed = (Math.random() * 1) + 0.5,
            opacity = (Math.random() * 0.5) + 0.3;

            flakes.push({
                speed: speed,
                velY: speed,
                velX: 0,
                x: x,
                y: y,
                size: size,
                stepSize: (Math.random()) / 30,
                step: 0,
                opacity: opacity
            });
        }

        snow();
    };

    // Actions

    $('#tweet-button').click(function(e)
    {
        var accumulation = $('#accumulation').text();
        var units = $('#units').text();

        if (accumulation && units && accumulation != "" && units != "")
        {
            window.open("http://twitter.com/share?text=" + accumulation + "%20" + units + "!%20" + "How%20much%20snow%20are%20you%20getting?");
        }
    });
});


function setCookie(c_name, value, exdays)
{
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value = escape(value) +
            ((exdays == null) ? "" : ("; expires=" + exdate.toUTCString()));
    document.cookie = c_name + "=" + c_value;
}

function getCookie(c_name)
{
    var i, x, y, mUserName = document.cookie.split(";");
    for (i = 0; i < mUserName.length; i++)
    {
        x = mUserName[i].substr(0, mUserName[i].indexOf("="));
        y = mUserName[i].substr(mUserName[i].indexOf("=") + 1);
        x = x.replace(/^\s+|\s+$/g, "");
        if (x == c_name)
        {
            return unescape(y);
        }
    }
}
 
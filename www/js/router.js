function goTo(currentPage, targetPage, functionToCall) {
    if (functionToCall) {
        functionToCall();
    }

    document.getElementById(currentPage).style.display = "none";
    document.getElementById(targetPage).style.display = "flex";
}
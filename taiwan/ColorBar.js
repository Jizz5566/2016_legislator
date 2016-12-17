function ColorBar(party, value) {
    if (party == 1 && value >= 0.05)
        return "blue"
    else if (party == 1 && value >= 0)
        return "lightblue"
    else if (party == 1 && value <= 0)
        return "yellowgreen"
    else if (party == 1 && value <= -0.05)
        return "green"
    else if (party == 16 && value <= -0.05)
        return "blue"
    else if (party == 16 && value <= 0)
        return "lightblue"
    else if (party == 16 && value >= 0)
        return "yellowgreen"
    else if (party == 16 && value >= 0.05)
        return "green"
    else if (party == 267 && value <= -0.05)
        return "blue"
    else if (party == 267 && value <= 0)
        return "lightblue"
    else if (party == 267 && value >= 0)
        return "yellow"
    else if (party == 267 && value >= 0.05)
        return "brown"
    else
        return "white"
}

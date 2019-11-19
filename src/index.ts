import * as d3 from "d3";
import { triangularGenerator } from "./generators";
var primes = require('prime-generator');

const container = d3.select("#graph");
const dimensions = (container.node()! as Element).getBoundingClientRect()

const svg = container
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height)
const graph = svg.append("g")
const popup = document.querySelector("#popup") as HTMLDivElement
const controls = document.querySelector("#controls") as HTMLFormElement;


interface IPixel {
    x: number,
    y: number,
    colour: string
};

type channelType = "prime" | "triangular" | "random" | "custom";

interface ISettings {
    pixelSize: number;
    rotation: "0" | "90";
    channelTypes: {
        red: channelType,
        green: channelType,
        blue: channelType,
    };
    customValues: {
        red: number,
        green: number,
        blue: number,
    }
}

function getSettings(): ISettings {
    const scaleControl = document.querySelector("#scale") as HTMLInputElement

    const rotationControl = controls["rotation"];

    const redChannelTypeControl = controls["red-channel"];
    const greenChannelTypeControl = controls["green-channel"];
    const blueChannelTypeControl = controls["blue-channel"];

    const redChannelCustomControl = document.querySelector("#red-channel-custom") as HTMLInputElement
    const greenChannelCustomControl = document.querySelector("#green-channel-custom") as HTMLInputElement
    const blueChannelCustomControl = document.querySelector("#blue-channel-custom") as HTMLInputElement

    return {
        pixelSize: parseInt(scaleControl.value),
        rotation: rotationControl.value,
        channelTypes: {
            red: redChannelTypeControl.value,
            green: greenChannelTypeControl.value,
            blue: blueChannelTypeControl.value,
        },
        customValues: {
            red: parseInt(redChannelCustomControl.value),
            green: parseInt(greenChannelCustomControl.value),
            blue: parseInt(blueChannelCustomControl.value),
        }
    }
}

function getChannelValue(type: channelType, primeValue: number, triValue: number, randomValue: number, customValue: number) {
    if (type == "prime") {
        return primeValue
    } else if (type == "triangular") {
        return triValue
    } else if (type == "random") {
        return randomValue
    } else if (type == "custom") {
        return customValue
    }
}

function drawGraph() {
    graph
        .selectAll("rect")
        .remove()

    const settings = getSettings();

    const pixels: IPixel[] = [];

    const P = primes();
    const T = triangularGenerator();

    for (var i = 0; i < (settings.rotation == "0" ? dimensions.height : dimensions.width); i += settings.pixelSize) {
        for (var j = 0; j < (settings.rotation == "0" ? dimensions.width : dimensions.height); j += settings.pixelSize) {
            const primeMod = P.next().value % 255;
            const triMod = T.next().value % 255;
            const randomMod = Math.floor(Math.random() * 255);

            const redValue = getChannelValue(settings.channelTypes.red, primeMod, triMod, randomMod, settings.customValues.red);
            const greenValue = getChannelValue(settings.channelTypes.green, primeMod, triMod, randomMod, settings.customValues.green);
            const blueValue = getChannelValue(settings.channelTypes.blue, primeMod, triMod, randomMod, settings.customValues.blue);

            const x = settings.rotation == "0" ? j : i;
            const y = settings.rotation == "0" ? i : j;

            pixels.push({
                x,
                y,
                colour: `rgb(${redValue}, ${greenValue}, ${blueValue})`,
            })
        }
    }

    graph
        .selectAll("rect")
        .data(pixels)
        .enter()
        .append("rect")
        .attr("x", (p: IPixel) => p.x)
        .attr("y", (p: IPixel) => p.y)
        .attr("width", settings.pixelSize)
        .attr("height", settings.pixelSize)
        .style("fill", (p: IPixel) => p.colour)
    popup.style.display = "none"
}

drawGraph()

var drawTimer: NodeJS.Timer = setTimeout(() => null, 0);
function drawGraphTimeout() {
    popup.style.display = "block"

    clearTimeout(drawTimer);

    setTimeout(drawGraph, 250);
}

controls!.addEventListener("change", drawGraphTimeout)

const radioGroups = ["red-channel", "green-channel", "blue-channel"];
for (const radioGroupName of radioGroups) {
    const radioGroup = controls[radioGroupName];
    const customValue = document.querySelector(`#${radioGroupName}-custom`) as HTMLInputElement

    for (var i = 0; i < 4; i++) {
        radioGroup[i].addEventListener("change", () => {
            customValue!.disabled = radioGroup.value != "custom"
        })
    }
}


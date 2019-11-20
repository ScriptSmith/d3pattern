import * as d3 from "d3";
import { primeGenerator, triangularGenerator } from "./generators";

const container = d3.select("#graph");
const dimensions = (container.node()! as Element).getBoundingClientRect();

const svg = container
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);
const graph = svg.append("g");
const popup = document.querySelector("#popup") as HTMLDivElement;
const controls = document.querySelector("#controls") as HTMLFormElement;

interface IPixel {
    x: number;
    y: number;
    colour: string;
}

type ChannelType = "prime" | "triangular" | "random" | "custom";

interface ICustomValues {
    red: number;
    green: number;
    blue: number;
}

interface ISettings {
    pixelSize: number;
    rotation: "0" | "90";
    channelTypes: {
        [key: string]: ChannelType,
    };
    customValues: {
        [key: string]: number,
    };
}

type IChannelValues = {
    [key in ChannelType] : number
};

function getSettings(): ISettings {
    const scaleControl = document.querySelector("#scale") as HTMLInputElement;

    const rotationControl = controls.rotation;

    const redChannelTypeControl = controls["red-channel"];
    const greenChannelTypeControl = controls["green-channel"];
    const blueChannelTypeControl = controls["blue-channel"];

    const redChannelCustomControl = document.querySelector("#red-channel-custom") as HTMLInputElement;
    const greenChannelCustomControl = document.querySelector("#green-channel-custom") as HTMLInputElement;
    const blueChannelCustomControl = document.querySelector("#blue-channel-custom") as HTMLInputElement;

    return {
        channelTypes: {
            blue: blueChannelTypeControl.value,
            green: greenChannelTypeControl.value,
            red: redChannelTypeControl.value,
        },
        customValues: {
            blue: parseInt(blueChannelCustomControl.value, 10),
            green: parseInt(greenChannelCustomControl.value, 10),
            red: parseInt(redChannelCustomControl.value, 10),
        },
        pixelSize: parseInt(scaleControl.value, 10),
        rotation: rotationControl.value,
    };
}

function getChannelValue(type: ChannelType, primeValue: number, triValue: number,
                         randomValue: number, customValue: number) {
    if (type === "prime") {
        return primeValue;
    } else if (type === "triangular") {
        return triValue;
    } else if (type === "random") {
        return randomValue;
    } else if (type === "custom") {
        return customValue;
    }
}

function drawGraph() {
    graph
        .selectAll("rect")
        .remove();

    const settings = getSettings();

    const pixels: IPixel[] = [];

    const P = primeGenerator(dimensions.width * dimensions.height);
    const T = triangularGenerator();

    const outerLimit = settings.rotation === "0" ? dimensions.height : dimensions.width;
    const innerLimit = settings.rotation === "0" ? dimensions.width : dimensions.height;

    for (let i = 0; i < outerLimit; i += settings.pixelSize) {
        for (let j = 0; j < innerLimit; j += settings.pixelSize) {
            const colourValues: number[] = [];

            const primeMod = P.next().value % 255;
            const triMod = T.next().value % 255;
            const randomMod = Math.floor(Math.random() * 255);

            for (const colourName of ["red", "green", "blue"]) {
                const generatedValues: IChannelValues = {
                    custom: settings.customValues[colourName],
                    prime: primeMod,
                    random: randomMod,
                    triangular: triMod,
                };

                colourValues.push(generatedValues[settings.channelTypes[colourName]]);
            }

            const x = settings.rotation === "0" ? j : i;
            const y = settings.rotation === "0" ? i : j;

            pixels.push({
                colour: `rgb(${colourValues[0]}, ${colourValues[1]}, ${colourValues[2]})`,
                x,
                y,
            });
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
        .style("fill", (p: IPixel) => p.colour);
    popup.style.display = "none";
}

drawGraph();

let drawTimer: NodeJS.Timer = setTimeout(() => null, 0);
function drawGraphTimeout() {
    popup.style.display = "block";

    clearTimeout(drawTimer);

    drawTimer = setTimeout(drawGraph, 250);
}

controls!.addEventListener("change", drawGraphTimeout);

const radioGroups = ["red-channel", "green-channel", "blue-channel"];
for (const radioGroupName of radioGroups) {
    const radioGroup = controls[radioGroupName];
    const customValue = document.querySelector(`#${radioGroupName}-custom`) as HTMLInputElement;

    for (let i = 0; i < 4; i++) {
        radioGroup[i].addEventListener("change", () => {
            customValue!.disabled = radioGroup.value !== "custom";
        });
    }
}

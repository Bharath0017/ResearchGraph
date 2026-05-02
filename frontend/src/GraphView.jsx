import { useEffect, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import axios from "axios";

function GraphView() {

  const [graphData, setGraphData] = useState({
    nodes: [],
    links: []
  });

  const API_URL = "http://127.0.0.1:8000";


  const fetchGraph = async () => {

    try {

      const res = await axios.get(
        `${API_URL}/graph`
      );

      const nodes = res.data.nodes.map(
        (node) => ({
          id: node
        })
      );

      const links = res.data.edges.map(
        (edge) => ({
          source: edge.source,
          target: edge.target
        })
      );

      setGraphData({
        nodes,
        links
      });

    } catch (err) {

      console.error(
        "Graph load error:",
        err
      );

    }

  };


  useEffect(() => {

    fetchGraph();

  }, []);


  return (

    <div
      style={{
        height: "500px",
        border: "1px solid gray",
        marginTop: "20px"
      }}
    >

    <ForceGraph2D
    graphData={graphData}

    nodeAutoColorBy="id"

    nodeLabel="id"

    linkDirectionalParticles={2}

    linkDirectionalParticleSpeed={0.002}
    />

    </div>

  );

}

export default GraphView;
import os
import pickle

from app.config import settings


class GraphStore:
    """
    Save and load knowledge graph
    using pickle (stable method)
    """

    def __init__(self):

        self.graph_path = os.path.join(
            settings.GRAPH_STORE_DIR,
            "knowledge_graph.pkl"
        )

        os.makedirs(
            settings.GRAPH_STORE_DIR,
            exist_ok=True
        )


    def save_graph(self, graph):

        """
        Save graph using pickle
        """

        with open(
            self.graph_path,
            "wb"
        ) as f:

            pickle.dump(
                graph,
                f
            )

        print(
            " Graph saved successfully."
        )


    def load_graph(self):

        """
        Load graph if exists
        """

        if os.path.exists(
            self.graph_path
        ):

            with open(
                self.graph_path,
                "rb"
            ) as f:

                return pickle.load(f)

        return None
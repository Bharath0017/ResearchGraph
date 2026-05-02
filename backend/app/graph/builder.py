import networkx as nx


class GraphBuilder:
    """
    Build knowledge graph.
    """

    def __init__(self):

        self.graph = nx.Graph()


    def add_entities(
        self,
        entities
    ):
        """
        Add nodes to graph.
        """

        for entity in entities:

            self.graph.add_node(
                entity
            )


    def add_relationships(
        self,
        relationships
    ):
        """
        Add edges to graph.
        """

        for entity1, entity2 in relationships:

            self.graph.add_edge(
                entity1,
                entity2
            )


    def get_graph(self):

        return self.graph
# Called to categorize and execute a requested action.

import util
from sys import path
from importlib import import_module

def main():
    path.append(".")

    queryobj = util.getQuery() # Retrieve query parameters
    module = import_module("packages." + queryobj["package"] + "." + queryobj["module"])
    # Find and execute the function with the necessary parameters
    return getattr(module, queryobj["action"]) (queryobj["query"], queryobj["entities"])
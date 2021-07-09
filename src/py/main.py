# Called to categorize and execute a requested action.

import util
from sys import path
from importlib import import_module

def main():
    path.append(".")

    queryobj = util.getQuery() # Retrieve query parameters
    packagepath = "data.packages." + queryobj["package"] + ".code." + queryobj["module"]
    module = import_module(packagepath)

    # Find and execute the function with the necessary parameters
    return getattr(module, queryobj["action"]) (queryobj["query"], queryobj["entities"])

if __name__ == '__main__':
	main()